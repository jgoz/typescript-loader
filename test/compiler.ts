/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/mocha/mocha.d.ts" />
/// <reference path="../defs/bluebird/bluebird.d.ts" />
/// <reference path="../defs/rimraf/rimraf.d.ts" />

import assert = require("assert");
import fs = require("fs");

import compiler = require("../src/compiler");
import CompileOptions = require("../src/options");

var rm = require("rimraf");

var outDir = "./tmp";

function createContext(file: string, options: CompileOptions): compiler.CompileContext {
    options.outDir = outDir;
    return {
        file: file,
        outPath: outDir,
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

    before(function() {
        if (fs.existsSync(outDir)) {
            rm.sync(outDir);
        }
        fs.mkdirSync(outDir);
    });

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
                assert.ok(result.sourcemap.mappings.indexOf("AAAA;IAGIA") >= 0, "mappings are correct");
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

    describe("with module=commonjs", function() {

        var compileResult: Promise<compiler.CompileResult>;

        before(function() {
            compileResult = compiler.compile(createContext(fixtures.b, { module: "commonjs" }));
        });

        it("translates import statements", function(done) {
            compileResult.done(result => {
                assert.ok(result.output.indexOf("var c = require(\"./c\")") >= 0, "import => var");
                done();
            });
        });

        it("translates <dependency> pragmas to require statements", function(done) {
            compileResult.done(result => {
                assert.ok(result.output.indexOf("require(\"./b.css\")") >= 0, "dependency with double quotes");
                assert.ok(result.output.indexOf("require('./b.less')") >= 0, "dependency with single quotes");
                assert.ok(result.output.indexOf("/// <dependency path=\"./b.css\" />") === -1, "strips pragma");
                assert.ok(result.output.indexOf("/// <dependency path='./b.less' />") === -1, "strips pragma");
                done();
            });
        });

    });


});
