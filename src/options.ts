interface CompileOptions {
    declaration?: boolean;
    module?: string;
    noResolve?: boolean;
    noImplicitAny?: boolean;
    outDir?: string;
    removeComments?: boolean;
    sourcemap?: boolean;
    target?: string;
}

export = CompileOptions;
