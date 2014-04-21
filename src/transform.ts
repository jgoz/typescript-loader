/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />
/// <reference path="../defs/through/through.d.ts" />

import through = require("through");
import Promise = require("bluebird");
import Settings = require("./settings");

import dependency = require("./transforms/dependency");
import stripSourcemap = require("./transforms/strip-sourcemap");

function streamPromise(stream: ReadableStream): Promise<string> {
    return new Promise((resolve: (value: string) => void, reject: (reason: any) => void) => {
        var output: string = "";
        stream.on("data", (data: string) => { output += data; }); // https://github.com/bnoordhuis/node-buffertools/issues/18#issuecomment-3161866
        stream.on("end", () => { resolve(output); });
        stream.on("error", (err: any) => { reject(err); });
    });
}

export function output(stream: ReadableStream, settings: Settings): Promise<string> {
    return streamPromise(stream
        .pipe(dependency(settings))
        .pipe(stripSourcemap(settings)));
}
