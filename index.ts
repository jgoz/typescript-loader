/// <reference path="defs/node/node.d.ts" />
/// <reference path="defs/webpack.d.ts" />

import fs = require("fs");
import loaderUtils = require("loader-utils");
import path = require("path");
import ts = require("ts-compiler");
import Promise = require("bluebird");

import compiler = require("./src/compiler");
import util = require("./src/util");


function replaceExt(filePath: string, ext: string) {
    return path.basename(filePath, path.extname(filePath)) + ext;
}

function loader(source: string): void {
    this.cacheable();
    this.async();

    var typescriptRequest: string = loaderUtils.getRemainingRequest(this);
    var javascriptRequest: string = loaderUtils.getCurrentRequest(this);

    var options: ts.ICompilerOptions;
    try {
        options = <ts.ICompilerOptions>loaderUtils.parseQuery(this.query);
    } catch (e) {
        return this.callback(e);
    }

    if (this.options.devtool) { // sourcemaps requested
        options.sourcemap = true;
    }

    compiler.compile({
        fileName: typescriptRequest,
        outputFileName: javascriptRequest,
        source: source,
        options: options,
        onInfo: this.emitWarning,
        onError: this.emitError
    }).then(results => {
        var expectedPath = path.normalize(typescriptRequest).replace(".ts", ".js");
        var res = util.find(results, f => path.normalize(f.name).indexOf(expectedPath) >= 0);

        this.callback(null, res.output, res.sourcemap);
    }).catch(err => {
        this.emitError(err);
    }).error(err => {
        this.callback(err);
    });
}

export = loader;
