/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/mocha/mocha.d.ts" />

import assert = require("assert");
import compiler = require("../src/compiler");
import fs = require("fs");
import ts = require("ts-compiler");

function createContext(file: string, options: ts.ICompilerOptions): compiler.CompileContext {
    return {
        fileName: file,
        source: fs.readFileSync(file).toString(),
        options: options
    };
}

describe("compiler", function() {
    this.timeout(5000);

    describe("using default options", function() {

        it("compiles without error", function(done) {
            compiler.compile(createContext("./test/fixture/a.ts", {})).done(result => {
                assert.ok(result.output.indexOf("function A()"));
                done();
            });
        });

    });

});
