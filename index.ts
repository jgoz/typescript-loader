/// <reference path="defs/node/node.d.ts" />
/// <reference path="defs/webpack.d.ts" />

import fs = require("fs");
import loaderUtils = require("loader-utils");
import path = require("path");
import ts = require("ts-compiler");
import Promise = require("bluebird");

import compiler = require("./src/compiler");


function replaceExt(filePath: string, ext: string) {
    return path.basename(filePath, path.extname(filePath)) + ext;
}

function loader(source: string): void {
    this.cacheable();
    this.async();

    var typescriptRequest = loaderUtils.getRemainingRequest(this);
    var javascriptRequest = loaderUtils.getCurrentRequest(this);

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
    }).then(res => {
        this.callback(null, res.output, res.sourcemap);
    }).catch(err => {
        this.callback(err);
    }).error(err => {
        this.callback(err);
    });
}

export = loader;
