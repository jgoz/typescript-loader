/// <reference path="../../defs/node/node.d.ts" />
/// <reference path="../../defs/through2.d.ts" />

import through = require("through2");
import Settings = require("../settings");

var sourcemapPattern = /^\s*\/\/[#@] sourceMap.*=.*(\r\n|\n)?/gm;

function stripSourcemap(settings: Settings): ReadWriteStream {
    if (settings.sourcemap) {
        return through(function transform(data: NodeBuffer, enc: string, callback: Function) {
            this.push(data.toString().replace(sourcemapPattern, ""));
            callback();
        });
    } else {
        return through();
    }
}

export = stripSourcemap;
