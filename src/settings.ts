var CodeGenTargets: string[] = ["ES3", "ES5"];
var ModuleGenTargets: string[] = ["commonjs", "amd"];

class Settings {
    declaration: boolean;
    module: string;
    noResolve: boolean;
    noImplicitAny: boolean;
    out: string;
    outDir: string;
    removeComments: boolean;
    sourcemap: boolean;
    target: string;

    constructor(query: Settings, debug: boolean) {
        var moduleId = (query.module || "").toLowerCase();
        if (moduleId && ModuleGenTargets.indexOf(moduleId) === -1) {
            throw new Error("'typescript-loader': Invalid module target '" + query.module + "'");
        }

        var targetId = (query.target || "").toUpperCase();
        if (targetId && CodeGenTargets.indexOf(targetId) === -1) {
            throw new Error("'typescript-loader': Invalid code gen target '" + query.target + "'");
        }

        this.declaration = query.declaration || false;
        this.module = moduleId;
        this.noResolve = query.noResolve === true;
        this.noImplicitAny = query.noImplicitAny === true;
        this.out = query.out;
        this.outDir = query.outDir;
        this.removeComments = query.removeComments === true;
        this.sourcemap = query.sourcemap || debug;
        this.target = targetId;
    }

    getArgs(): string[] {
        var args: string[] = [];

        if (this.declaration) {
            args.push("--declaration");
        }
        if (this.module) {
            args.push("--module", this.module);
        }
        if (this.noResolve) {
            args.push("--noResolve");
        }
        if (this.noImplicitAny) {
            args.push("--noImplicitAny");
        }
        if (this.out) {
            args.push("--out", this.out);
        }
        if (this.outDir) {
            args.push("--outDir", this.outDir);
        }
        if (this.removeComments) {
            args.push("--removeComments");
        }
        if (this.sourcemap) {
            args.push("--sourcemap");
        }
        if (this.target) {
            args.push("--target", this.target);
        }

        return args;
    }
}

export = Settings;
