/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />
/// <reference path="../defs/webpack.d.ts" />

import Promise = require("bluebird");
import CompileOptions = require("./options");

import dependency = require("./transforms/dependency");
import stripSourcemap = require("./transforms/strip-sourcemap");
import toSourcemap = require("./transforms/sourcemap");

export function output(stream: ReadableStream, options: CompileOptions): Promise<string> {
    var outputStream = stream
        .pipe(dependency(options))
        .pipe(stripSourcemap(options));

    return new Promise<string>((resolve, reject) => {
        var output: string = "";
        outputStream.on("data", (data: string) => { output += data; }); // https://github.com/bnoordhuis/node-buffertools/issues/18#issuecomment-3161866
        outputStream.on("end", () => { resolve(output); });
        outputStream.on("error", (err: any) => { reject(err); });
    });
}

export function sourcemap(stream: ReadableStream, request: string, source: string): Promise<webpack.SourceMap> {
    var sourcemapStream = stream.pipe(toSourcemap(request, source));

    return new Promise<webpack.SourceMap>((resolve, reject) => {
        var result: webpack.SourceMap;
        sourcemapStream.on("data", (data: webpack.SourceMap) => { result = data; });
        sourcemapStream.on("end", () => { resolve(result); });
        sourcemapStream.on("error", (err: any) => { reject(err); });
    });
}
