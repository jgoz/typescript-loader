/// <reference path="../../defs/node/node.d.ts" />
/// <reference path="../../defs/through2.d.ts" />

import through = require("through2");
import ts = require("ts-compiler");

var dependencyPattern = /^\/\/\/\s*<(amd-)?dependency\s+path\s*=\s*("|')(.+?)("|')\s*\/\s*>\s*$/gm;

function rewriteDependencies(options: ts.ICompilerOptions): ReadWriteStream {
    if (options.module === "commonjs") {
        return through(function transform(data: NodeBuffer, enc: string, callback: Function) {
            this.push(data.toString().replace(dependencyPattern, "require($2$3$4);"));
            callback();
        });
    } else {
        return through();
    }
}

export = rewriteDependencies;
