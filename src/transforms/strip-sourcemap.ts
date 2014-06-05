/// <reference path="../../defs/node/node.d.ts" />
/// <reference path="../../defs/through2.d.ts" />

import through = require("through2");
import ts = require("ts-compiler");

var sourcemapPattern = /^\s*\/\/[#@] sourceMap.*=.*(\r\n|\n)?/gm;

function stripSourcemap(options: ts.ICompilerOptions): ReadWriteStream {
    if (options.sourcemap) {
        return through(function transform(data: NodeBuffer, enc: string, callback: Function) {
            this.push(data.toString().replace(sourcemapPattern, ""));
            callback();
        });
    } else {
        return through();
    }
}

export = stripSourcemap;
