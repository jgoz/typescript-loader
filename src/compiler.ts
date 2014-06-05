/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/ts-compiler.d.ts" />
/// <reference path="../defs/webpack.d.ts" />

import ts = require("ts-compiler");
import Promise = require("bluebird");

import transform = require("./transform");

export interface CompileResult {
    output: string;
    sourcemap?: webpack.SourceMap;
}

export interface CompileContext {
    fileName: string;
    webpackRequest?: string;
    source: string;
    options: ts.ICompilerOptions;
    onInfo?: (info: string) => void;
    onError?: (err: string) => void;
}

export function compile (ctx: CompileContext): Promise<CompileResult> {

    ctx.options.skipWrite = true;

    return new Promise<CompileResult>((resolve, reject) => {
        var compiler = ts.compile([ctx.fileName], ctx.options, (err: Error, results: ts.OutputFile[]) => {
            if (err) {
                reject(err);
            } else {
                var jsResult: ts.OutputFile = results.filter((res: ts.OutputFile) => { return res.fileType === 0; /* js */ })[0];

                var output: Promise<string> = transform.output(jsResult.text, ctx.options);
                var sourcemap: Promise<webpack.SourceMap>;

                if (ctx.options.sourcemap) {
                    var mapResult: ts.OutputFile = results.filter((res: ts.OutputFile) => { return res.fileType === 1; /* sourcemap */ })[0];
                    sourcemap = transform.sourcemap(mapResult.text, ctx.webpackRequest, ctx.source);
                }

                Promise.all([output, sourcemap]).spread((o: string, sm: webpack.SourceMap) => {
                    resolve({ output: o, sourcemap: sm });
                });
            }
        });

        if (ctx.onInfo) {
            compiler.on("info", ctx.onInfo);
        }
        if (ctx.onError) {
            compiler.on("error", ctx.onError);
        }
    });
}
