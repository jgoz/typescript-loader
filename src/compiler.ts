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
    return new Promise((resolve: (value: CompileResult) => void, reject: (reason: any) => void) => {
        var proc = spawn("node", args, { stdio: "pipe" });
        var output: string[] = [];

        proc.stdout.on("data", (data: string) => { output.push(data); });
        proc.stderr.on("data", (data: string) => { output.push(data); });

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
    //var pkg = JSON.parse(fs.readFileSync(path.resolve(binPath, '..', 'package.json')).toString());
    //grunt.log.writeln('Using tsc v' + pkg.version);

    return path.join(binPath, 'tsc');
}

export function compile (file: string, settings: Settings): Promise<CompileResult> {
    var args: string[] = settings.getArgs().concat('"' + path.resolve(file) + '"');
    var tsc: string = getTsc(resolveTypeScriptBinPath());

    return executeNode([tsc].concat(args)).then((result: CompileResult) => {
        // TODO: Do something with result?
        return Promise.cast(result);
    }, (err) => {
        return err;
    });
}
