/// <reference path="defs/node/node.d.ts" />
/// <reference path="defs/webpack.d.ts" />
/// <reference path="defs/temp.d.ts" />

import fs = require("fs");
import loaderUtils = require("loader-utils");
import path = require("path");
import temp = require("temp");
import Promise = require("bluebird");

import compiler = require("./src/compiler");
import transform = require("./src/transform");
import Settings = require("./src/settings");

temp.track(); // clean up files on exit

function replaceExt(filePath: string, ext: string) {
    return path.basename(filePath, path.extname(filePath)) + ext;
}

function loader (source: string): void {
    this.cacheable();
    this.async();

    var loaderRequest = loaderUtils.getCurrentRequest(this);
    var fileRequest = loaderUtils.getRemainingRequest(this);

    var settings: Settings;
    try {
        settings = new Settings(<Settings>loaderUtils.parseQuery(this.query), this.debug);
    } catch (e) {
        return this.callback(e);
    }

    temp.mkdir("tsloader", (err, dirPath) => {
        if (err) { return this.callback(err); }
        settings.outDir = dirPath;

        compiler.compile(fileRequest, settings).then((res) => {
            if (res.code !== 0) {
                res.output.forEach(out => { this.emitError(out); });
            }

            var outFile: string = replaceExt(path.basename(fileRequest), ".js");
            var outStream: ReadableStream = fs.createReadStream(path.join(dirPath, outFile), { encoding: "utf8" });

            var output: Promise<string> = transform.output(outStream, settings);
            var sourcemap: Promise<webpack.SourceMap>;

            if (settings.sourcemap) {
                var mapStream: ReadableStream = fs.createReadStream(path.join(dirPath, outFile + ".map"), { encoding: "utf8" });
                sourcemap = transform.sourcemap(mapStream, loaderRequest, source);
            }

            Promise.all([output, sourcemap]).spread((o: string, sm: webpack.SourceMap) => {
                this.callback(null, o, sm);
            });
        }).catch(err => {
            this.callback(err);
        }).error(err => {
            this.callback(err);
        });
    });
}

export = loader;
