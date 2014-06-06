/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/ts-compiler.d.ts" />
/// <reference path="../defs/webpack.d.ts" />

import ts = require("ts-compiler");
import Promise = require("bluebird");

import transform = require("./transform");
import util = require("./util");

export interface CompileResult {
    name: string;
    output: string;
    sourcemap?: webpack.SourceMap;
}

export interface CompileContext {
    fileName: string;
    outputFileName?: string;
    source: string;
    options: ts.ICompilerOptions;
    onInfo?: (info: string) => void;
    onError?: (err: string) => void;
}

export function compile (ctx: CompileContext): Promise<CompileResult[]> {

    ctx.options.skipWrite = true;

    var compileResults: Promise<CompileResult>[] = [];

    var compiler = ts.compile([ctx.fileName], ctx.options, (err: Error, results: ts.OutputFile[]) => {
        if (err) {
            compileResults.push(Promise.reject(err));
        } else {
            var groupedResults = util.groupBy(results, f => f.name.replace(".map", ""));

            Object.keys(groupedResults).forEach(key => {
                var files = groupedResults[key];

                var jsResult: ts.OutputFile = util.find(files, f => f.fileType === ts.api.OutputFileType.JavaScript);
                var output: Promise<string> = transform.output(jsResult.text, ctx.options);

                var sourcemap: Promise<webpack.SourceMap>;
                if (ctx.options.sourcemap) {
                    var mapResult: ts.OutputFile = util.find(files, f => f.fileType === ts.api.OutputFileType.SourceMap);
                    sourcemap = transform.sourcemap(mapResult.text, ctx.outputFileName, ctx.source);
                }

                compileResults.push(<Promise<CompileResult>>Promise
                    .join(output, sourcemap)
                    .spread((o: string, sm: webpack.SourceMap) => ({ name: jsResult.name, output: o, sourcemap: sm })));
            });
        }
    });

    if (ctx.onInfo) {
        compiler.on("info", ctx.onInfo);
    }
    if (ctx.onError) {
        compiler.on("error", ctx.onError);
    }

    return Promise.all(compileResults);
}
