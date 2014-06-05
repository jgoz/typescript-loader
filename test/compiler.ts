/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/mocha/mocha.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />

import assert = require("assert");
import compiler = require("../src/compiler");
import fs = require("fs");
import ts = require("ts-compiler");

function createContext(file: string, options: ts.ICompilerOptions): compiler.CompileContext {
    return {
        fileName: file,
        outputFileName: file.replace(".ts", ".js"),
        source: fs.readFileSync(file).toString(),
        options: options
    };
}

var fixtures = {
    a: "./test/fixture/a.ts",
    b: "./test/fixture/b.ts"
};

describe("compiler", function() {
    this.timeout(5000);

    describe("using default options", function() {

        var compileResult: Promise<compiler.CompileResult>;

        before(function() {
            compileResult = compiler.compile(createContext(fixtures.a, {}));
        });

        it("compiles without error", function(done) {
            compileResult.done(result => {
                assert.ok(result.output.indexOf("function A()") >= 0, "contains compiled JS code");
                done();
            });
        });

        it("excludes sourcemap", function(done) {
            compileResult.done(result => {
                assert.ok(!result.sourcemap, "does not contain sourcemap");
                done();
            });
        });

    });

    describe("with sourcemap enabled", function() {

        var ctx = createContext(fixtures.a, { sourcemap: true });
        var compileResult: Promise<compiler.CompileResult>;

        before(function() {
            compileResult = compiler.compile(ctx);
        });

        it("generates sourcemap if requested", function(done) {
            compileResult.done(result => {
                assert.ok(result.sourcemap, "sourcemap is set");
                assert.strictEqual(result.sourcemap.file, "a.js", "file property is correct");
                assert.strictEqual(result.sourcemap.mappings, "AAAA;IAGIA;QACIC,IAAIA,CAACA,GAAGA,GAAGA,GAAGA;IAClBA,CAACA;IACLD,SAACA;AAADA,CAACA,IAAA", "mappings are correct");
                assert.deepEqual(result.sourcemap.sources, ["./test/fixture/a.js"], "sources is set");
                assert.deepEqual(result.sourcemap.sourcesContent, [ctx.source], "sourcesContent is set");
                done();
            });
        });

        it("strips sourcemap comment from output", function(done) {
            compileResult.done(result => {
                assert.ok(!/sourceMap.*=/.test(result.output), "sourceMappingURL field was removed");
                done();
            });
        });

    });

});
