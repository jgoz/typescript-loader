/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />
/// <reference path="../defs/webpack.d.ts" />

import ts = require("ts-compiler");
import Promise = require("bluebird");
import Stream = require("stream")

import dependency = require("./transforms/dependency");
import stripSourcemap = require("./transforms/strip-sourcemap");
import toSourcemap = require("./transforms/sourcemap");
import StringReader = require("./util/stringreader");

export function output(text: string, options: ts.ICompilerOptions): Promise<string> {
    var textStream = new StringReader(text);

    var outputStream = textStream
        .pipe(dependency(options))
        .pipe(stripSourcemap(options));

    textStream.resume();

    return new Promise<string>((resolve, reject) => {
        var output: string = "";
        outputStream.on("data", (data: string) => { output += data; }); // https://github.com/bnoordhuis/node-buffertools/issues/18#issuecomment-3161866
        outputStream.on("end", () => { resolve(output); });
        outputStream.on("error", (err: any) => { reject(err); });
    });
}

export function sourcemap(text: string, request: string, source: string): Promise<webpack.SourceMap> {
    var textStream = new StringReader(text);

    var sourcemapStream = textStream.pipe(toSourcemap(request, source));
    textStream.resume();

    return new Promise<webpack.SourceMap>((resolve, reject) => {
        var result: webpack.SourceMap;
        sourcemapStream.on("data", (data: webpack.SourceMap) => { result = data; });
        sourcemapStream.on("end", () => { resolve(result); });
        sourcemapStream.on("error", (err: any) => { reject(err); });
    });
}
