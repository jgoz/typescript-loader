/// <reference path="../../defs/node/node.d.ts" />
/// <reference path="../../defs/through/through.d.ts" />

import stream = require("stream");
import through = require("through");
import Settings = require("../settings");

var sourcemapPattern = /^\s*\/\/[#@] sourceMap.*=.*(\r\n|\n)?/gm;

function stripSourcemap(settings: Settings): ReadWriteStream {
    if (settings.sourcemap) {
        return through(function write(data: string) {
            this.queue(data.replace(sourcemapPattern, ""));
        });
    } else {
        return new stream.PassThrough();
    }
}

export = stripSourcemap;
