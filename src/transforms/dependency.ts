/// <reference path="../../defs/node/node.d.ts" />
/// <reference path="../../defs/through/through.d.ts" />

import stream = require("stream");
import through = require("through");
import Settings = require("../settings");

var dependencyPattern = /^\/\/\/\s*<(amd-)?dependency\s+path\s*=\s*("|')(.+?)("|')\s*\/\s*>\s*$/gm;

function rewriteDependencies(settings: Settings): ReadWriteStream {
    if (settings.module === "commonjs") {
        return through(function write(data: string) {
            var content = data;
            this.queue(content.replace(dependencyPattern, "require($2$3$4);"));
        });
    } else {
        return new stream.PassThrough();
    }
}

export = rewriteDependencies;
