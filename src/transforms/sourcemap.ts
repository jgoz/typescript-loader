/// <reference path="../../defs/node/node.d.ts" />
/// <reference path="../../defs/through2/through2.d.ts" />
/// <reference path="../../defs/webpack.d.ts" />

import through = require("through2");

function toSourcemap(request: string, source: string): NodeJS.ReadWriteStream {
    return through.obj(function transform(data: NodeBuffer, enc: string, callback: Function) {
        var sourcemap = <webpack.SourceMap>JSON.parse(data.toString());
        sourcemap.sourcesContent = [source];
        sourcemap.sources = [request];

        this.push(sourcemap);
        callback();
    });
}

export = toSourcemap;
