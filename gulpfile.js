"use strict";

var glob = require("glob");
var gulp = require("gulp");
var gutil = require("gulp-util");
var mocha = require("gulp-mocha");
var jshint = require("gulp-jshint");
var path = require("path");
var spawn = require("child_process").spawn;

//-------------------------------------------
// Perform static analysis on project sources.
gulp.task("jshint", function () {
    return gulp.src(["*.js", "src/*.js", "tests/*.js"])
        .pipe(jshint())
        .pipe(jshint.reporter("jshint-stylish"));
});

//-------------------------------------------
// Execute unit tests.
gulp.task("test:unit", function () {
    return gulp.src("./tests/*.js").pipe(mocha());
});

//-------------------------------------------
// Execute integration tests.
gulp.task("test:integration", function () {
    return gulp.src("./tests/integration/*.js").pipe(mocha());
});

function build(watch, done) {
    var typescriptPath = path.resolve(require.resolve("typescript"));
    var tscpath = path.join(path.dirname(typescriptPath), "tsc");

    var args = [tscpath];
    args.push("--module", "commonjs");
    args.push("--noImplicitAny");
    args.push("--target", "ES5");
    args.push("--outDir", "dist");
    if (watch) {
        args.push("--watch");
    }
    args.push.apply(args, glob.sync("./*.ts"));
    args.push.apply(args, glob.sync("./src/*.ts"));

    var tsc = spawn("node", args, { stdio: "inherit" });
    tsc.on("exit", function (code) {
        if (code !== 0) { gutil.beep(); }
        if (!watch) { done(code === 0 ? undefined : "Typescript compilation failed."); }
    });
    tsc.on("error", function (err) {
        if (watch) {
            gutil.log(err);
        } else {
            done(err);
        }
    });
}

//-------------------------------------------
// Build project for distribution
gulp.task("build", function (done) {
    build(false, done);
});

//-------------------------------------------
// Watch project sources
gulp.task("watch", function (done) {
    build(true, done);
});

gulp.task("test", ["test:unit", "test:integration"]);
gulp.task("default", ["jshint", "test"]);
