/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/mocha/mocha.d.ts" />

import assert = require("assert");
import compiler = require("../src/compiler");
import Settings = require("../src/settings");

describe("compiler", function() {

    describe("using default settings", function() {
        var settings: Settings = new Settings(<Settings>{
            declaration: false,
            module: "",
            noResolve: false,
            noImplicitAny: false,
            outDir: "dist/test/fixture",
            removeComments: false,
            sourcemap: false,
            target: ""
        }, false);

        it("compiles without error", function(done) {
            compiler.compile("./test/fixture/a.ts", settings).done((result) => {
                assert.strictEqual(result.code, 0);
                assert.deepEqual(result.output, []);
                done();
            });
        });

    });

});
