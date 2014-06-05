/// <reference path="./typescript-api.d.ts" />

declare module 'ts-compiler' {
    export import api = require('typescript-api');
    import events = require('events');
    export function compile(files: string[], options?: any, callback?: Function): BatchCompiler;
    export interface ICompilerOptions {
        /**
        * Generates corresponding .d.ts file.
        */
        declaration?: boolean;
        /**
        * Print this message.
        */
        help?: boolean;
        /**
        * Specifies the location where debugger should locate map files
        * instead of generated locations.
        */
        mapRoot?: string;
        /**
        * Specify module code generation: 'commonjs' or 'amd'
        */
        module?: string;
        /**
        * Warn on expressions and declarations with any implied 'any' type.
        */
        noImplicitAny?: boolean;
        /**
        * Skip resolution and preprocessing.
        */
        noResolve?: boolean;
        /**
        * Concatenate and emit output to a single file.
        */
        out?: string;
        /**
        * Redirect output structure to the directory.
        */
        outDir?: string;
        /**
        * Do not emit comments to output.
        */
        removeComments?: boolean;
        /**
        * Generates corresponding .map file.
        */
        sourcemap?: boolean;
        /**
        * Specifies the location where debugger should locate TypeScript
        * files instead of source locations.
        */
        sourceRoot?: string;
        /**
        * Specify ECMAScript target version: 'ES3' (default), or 'ES5'
        */
        target?: string;
        /**
        * Print the compiler's version: 0.9.5.0
        */
        version?: string;
        /**
        * Watch input files.
        */
        watch?: boolean;
        /**
        * Insert command line options and files from a file.
        */
        optionsFile?: string;
        /**
        * Skip writing the output files.
        */
        skipWrite?: boolean;
    }
    export class BatchCompiler extends events.EventEmitter {
        private _skipWrite;
        private _compiler;
        constructor();
        private redirectErrors();
        public compile(files: string[], options?: any, callback?: Function): BatchCompiler;
        private _batchCompile(callback);
        private _compile(callback);
    }
    export class OutputFile extends api.OutputFile {
    }
}
