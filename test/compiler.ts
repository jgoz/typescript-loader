/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/mocha/mocha.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />

import assert = require("assert");
import fs = require("fs");
import ts = require("ts-compiler");

import compiler = require("../src/compiler");
import util = require("../src/util");

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

        var compileResults: Promise<compiler.CompileResult[]>;

        before(function() {
            compileResults = compiler.compile(createContext(fixtures.a, {}));
        });

        it("compiles without error", function(done) {
            compileResults.done(results => {
                assert.strictEqual(results.length, 1, "exactly 1 result");

                var result = results[0];
                assert.ok(result.output.indexOf("function A()") >= 0, "contains compiled JS code");

                done();
            });
        });

        it("excludes sourcemap", function(done) {
            compileResults.done(results => {
                assert.strictEqual(results.length, 1, "exactly 1 result");

                var result = results[0];
                assert.ok(!result.sourcemap, "does not contain sourcemap");

                done();
            });
        });

    });

    describe("with sourcemap enabled", function() {

        var ctx = createContext(fixtures.a, { sourcemap: true });
        var compileResults: Promise<compiler.CompileResult[]>;

        before(function() {
            compileResults = compiler.compile(ctx);
        });

        it("generates sourcemap if requested", function(done) {
            compileResults.done(results => {
                assert.strictEqual(results.length, 1, "exactly 1 result");

                var result = results[0];
                assert.ok(result.sourcemap, "sourcemap is set");
                assert.strictEqual(result.sourcemap.file, "a.js", "file property is correct");
                assert.strictEqual(result.sourcemap.mappings, "AAAA;IAGIA;QACIC,IAAIA,CAACA,GAAGA,GAAGA,GAAGA;IAClBA,CAACA;IACLD,SAACA;AAADA,CAACA,IAAA", "mappings are correct");
                assert.deepEqual(result.sourcemap.sources, ["./test/fixture/a.js"], "sources is set");
                assert.deepEqual(result.sourcemap.sourcesContent, [ctx.source], "sourcesContent is set");

                done();
            });
        });

        it("strips sourcemap comment from output", function(done) {
            compileResults.done(results => {
                assert.strictEqual(results.length, 1, "exactly 1 result");

                var result = results[0];
                assert.ok(!/sourceMap.*=/.test(result.output), "sourceMappingURL field was removed");

                done();
            });
        });

    });

    describe("with module=commonjs", function() {

        var compileResults: Promise<compiler.CompileResult[]>;

        before(function() {
            compileResults = compiler.compile(createContext(fixtures.b, { module: "commonjs" }));
        });

        it("translates import statements", function(done) {
            compileResults.done(results => {
                assert.strictEqual(results.length, 2, "exactly 2 results");

                var b = util.find(results, r => r.name.indexOf("b.js") >= 0);
                assert.ok(b.output.indexOf("var c = require(\"./c\")") >= 0, "import => var");
                done();
            });
        });

        it("translates <dependency> pragmas to require statements", function(done) {
            compileResults.done(results => {
                assert.strictEqual(results.length, 2, "exactly 2 results");

                var b = util.find(results, r => r.name.indexOf("b.js") >= 0);
                assert.ok(b.output.indexOf("require(\"./b.css\")") >= 0, "dependency with double quotes");
                assert.ok(b.output.indexOf("require('./b.less')") >= 0, "dependency with single quotes");
                assert.ok(b.output.indexOf("/// <dependency path=\"./b.css\" />") === -1, "strips pragma");
                assert.ok(b.output.indexOf("/// <dependency path='./b.less' />") === -1, "strips pragma");
                done();
            });
        });

    });

});
