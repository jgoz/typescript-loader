/// <reference path="defs/node/node.d.ts" />
/// <reference path="defs/webpack.d.ts" />

import loaderUtils = require("loader-utils");

//-------------------------------------------
enum CodeGenTarget { es3 = 0, es5 = 1 };
enum ModuleGenTarget { none = 0, commonjs = 1, amd = 2 };

//-------------------------------------------
class Settings {
    declaration: boolean;
    module: ModuleGenTarget;
    noResolve: boolean;
    noImplicitAny: boolean;
    out: string;
    outDir: string;
    removeComments: boolean;
    sourcemap: boolean;
    target: CodeGenTarget;

    constructor(query: Settings, debug: boolean) {
        this.declaration = query.declaration || false;
        this.module = query.module; //(typeof query.module == "string" ? (<any>ModuleGenTarget)[query.module.toLowerCase()] : ModuleGenTarget.none);
        this.noResolve = query.noResolve == true;
        this.noImplicitAny = query.noImplicitAny == true;
        this.out = query.out;
        this.outDir = query.outDir;
        this.removeComments = query.removeComments == true;
        this.sourcemap = query.sourcemap || debug;
        this.target = query.target; //(typeof query.target == "string" ? (<any>CodeGenTarget)[query.target.toLowerCase()] : CodeGenTarget.es3);
    }
}


//-------------------------------------------
var typescriptLoader = function (source: string) {
    this.cacheable();
    this.async();

    var tsRequest = loaderUtils.getRemainingRequest(this);
    var jsRequest = loaderUtils.getCurrentRequest(this);
    var settings = new Settings(<Settings>loaderUtils.parseQuery(this.query), this.debug);

};

module.exports = typescriptLoader;