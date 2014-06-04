/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />
/// <reference path="../defs/webpack.d.ts" />

import fs = require("fs");
import path = require("path");
import Promise = require("bluebird");

import transform = require("./transform");
import CompileOptions = require("./options");

var spawn = require("child_process").spawn;

export interface CompileResult {
    name: string;
    output: string;
    sourcemap?: webpack.SourceMap;
}

export interface CompileContext {
    file: string;
    outPath: string;
    outputFileName?: string;
    source: string;
    options: CompileOptions;
    onError?: (err: string) => void;
}

interface CompileOutput {
    code: number;
    output: string[];
}

function executeNode (args: string[]): Promise<CompileOutput> {
    return new Promise<CompileOutput>((resolve, reject) => {
        var proc = spawn("node", args, { stdio: "pipe" });
        var output: string[] = [];

        proc.stdout.on("data", (data: NodeBuffer) => { output.push(data.toString()); });
        proc.stderr.on("data", (data: NodeBuffer) => { output.push(data.toString()); });

        proc.on("error", reject);
        proc.on("exit", function onExit (code: number) {
            var result: CompileOutput = {
                code: code,
                output: output
            };

            resolve(result);
        });
    });
}

function resolveTypeScriptBinPath(): string {
    var ownRoot = path.resolve(path.dirname((module).filename), '../..');
    var userRoot = path.resolve(ownRoot, '..', '..');
    var binSub = path.join('node_modules', 'typescript', 'bin');

    if (fs.existsSync(path.join(userRoot, binSub))) {
        // Using project override
        return path.join(userRoot, binSub);
    }
    return path.join(ownRoot, binSub);
}

function getTsc(binPath: string): string {
    return path.join(binPath, 'tsc');
}


function getArgs(options: CompileOptions): string[] {
    var args: string[] = [];

    if (options.declaration) {
        args.push("--declaration");
    }
    if (options.module) {
        args.push("--module", options.module);
    }
    if (options.noResolve) {
        args.push("--noResolve");
    }
    if (options.noImplicitAny) {
        args.push("--noImplicitAny");
    }
    if (options.outDir) {
        args.push("--outDir", options.outDir);
    }
    if (options.removeComments) {
        args.push("--removeComments");
    }
    if (options.sourcemap) {
        args.push("--sourcemap");
    }
    if (options.target) {
        args.push("--target", options.target);
    }

    return args;
}

function replaceExt(filePath: string, ext: string) {
    return path.basename(filePath, path.extname(filePath)) + ext;
}

export function compile (ctx: CompileContext): Promise<CompileResult> {
    var args: string[] = getArgs(ctx.options).concat('"' + path.resolve(ctx.file) + '"');
    var tsc: string = getTsc(resolveTypeScriptBinPath());

    return executeNode([tsc].concat(args)).then(res => {
        if (res.code !== 0) {
            res.output.forEach(ctx.onError);
        }

        var outFile: string = replaceExt(path.basename(ctx.file), ".js");
        var outStream: NodeJS.ReadableStream = fs.createReadStream(path.join(ctx.outPath, outFile), { encoding: "utf8" });
        var javascript: Promise<string> = transform.output(outStream, ctx.options);

        var sourcemap: Promise<webpack.SourceMap>;
        if (ctx.options.sourcemap) {
            var mapStream: NodeJS.ReadableStream = fs.createReadStream(path.join(ctx.outPath, outFile + ".map"), { encoding: "utf8" });
            sourcemap = transform.sourcemap(mapStream, ctx.outputFileName, ctx.source);
        }

        return <Promise<CompileResult>>Promise
            .join(javascript, sourcemap)
            .spread((o: string, sm: webpack.SourceMap) => ({
                name: outFile,
                output: o,
                sourcemap: sm
            }));
    });
}
