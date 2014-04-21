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

    var tsRequest = loaderUtils.getRemainingRequest(this);
    var settings: Settings;
    try {
        settings = new Settings(<Settings>loaderUtils.parseQuery(this.query), this.debug);
    } catch (e) {
        return this.callback(e);
    }

    temp.mkdir("tsloader", (err, dirPath) => {
        if (err) { return this.callback(err); }
        settings.outDir = dirPath;

        compiler.compile(tsRequest, settings).then((res) => {
            if (res.code !== 0) {
                res.output.forEach(out => { this.emitError(out); });
                //return this.callback("'typescript-loader': Compilation failed for '" + tsRequest + "'");
            }

            var outFile: string = replaceExt(path.basename(tsRequest), ".js");
            var outStream: ReadableStream = fs.createReadStream(path.join(dirPath, outFile), { encoding: "utf8" });

            transform.output(outStream, settings).then(output => {
                if (settings.sourcemap) {
                    var mapFile: string = outFile + ".map";
                    var sourcemap: NodeBuffer = fs.readFileSync(path.join(dirPath, mapFile));
                    this.callback(null, output, JSON.parse(sourcemap.toString()));
                } else {
                    this.callback(null, output);
                }
            });
        }).catch(err => {
            this.callback(err);
        }).error(err => {
            this.callback(err);
        });
    });
}

export = loader;
