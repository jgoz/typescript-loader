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
import CompileOptions = require("./src/options");

temp.track(); // clean up files on exit

function loader (source: string): void {
    this.cacheable();
    this.async();

    var loaderRequest = loaderUtils.getCurrentRequest(this);
    var fileRequest = loaderUtils.getRemainingRequest(this);

    var options = <CompileOptions>loaderUtils.parseQuery(this.query);

    temp.mkdir("tsloader", (err, dirPath) => {
        if (err) { return this.callback(err); }
        options.outDir = dirPath;

        compiler.compile({
            file: fileRequest,
            outPath: dirPath,
            outputFileName: loaderRequest,
            source: source,
            options: options,
            onError: this.emitError
        }).then((res) => {
            this.callback(null, res.output, res.sourcemap);
        }).catch(err => {
            this.emitError(err);
        }).error(err => {
            this.callback(err);
        });
    });
}

export = loader;
