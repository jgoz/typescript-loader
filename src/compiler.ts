/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />
/// <reference path="../defs/webpack.d.ts" />

import fs = require("fs");
import path = require("path");

import Settings = require("./settings");
import Promise = require("bluebird");
var spawn = require("child_process").spawn;

export interface CompileResult {
    code: number;
    output: string[];
    fileCount?: number;
}

function executeNode (args: string[]): Promise<CompileResult> {
    return new Promise<CompileResult>((resolve, reject) => {
        var proc = spawn("node", args, { stdio: "pipe" });
        var output: string[] = [];

        proc.stdout.on("data", (data: NodeBuffer) => { output.push(data.toString()); });
        proc.stderr.on("data", (data: NodeBuffer) => { output.push(data.toString()); });

        proc.on("error", reject);
        proc.on("exit", function onExit (code: number) {
            var result: CompileResult = {
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

export function compile (file: string, settings: Settings): Promise<CompileResult> {
    var args: string[] = settings.getArgs().concat('"' + path.resolve(file) + '"');
    var tsc: string = getTsc(resolveTypeScriptBinPath());

    return executeNode([tsc].concat(args));
}
