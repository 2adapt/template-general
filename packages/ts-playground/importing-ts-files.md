Try to compile:

```
$ ./node_modules/.bin/tsc

src/main.ts:3:25 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

3 import { PI, now } from './subdir/the-module.ts';
                          ~~~~~~~~~~~~~~~~~~~~~~~~


Found 1 error in src/main.ts:3

```


Add `--allowImportingTsExtensions`

```
$ ./node_modules/.bin/tsc --allowImportingTsExtensions
tsconfig.json:2:3 - error TS5096: Option 'allowImportingTsExtensions' can only be used when either 'noEmit' or 'emitDeclarationOnly' is set.

2   "compilerOptions": {
    ~~~~~~~~~~~~~~~~~


Found 1 error in tsconfig.json:2
```

Works ok with the extra `--noEmit` or `--emitDeclarationOnly`.

However we want to import `*.ts` files, and still have output files in "build". With version 5.7 this is now possible:

"we’ve added a new compiler option called --rewriteRelativeImportExtensions. When an import path:

- is relative (starts with ./ or ../),
- ends in a TypeScript extension (.ts, .tsx, .mts, .cts)
- is a non-declaration file

then the compiler will rewrite the path to the corresponding JavaScript extension (.js, .jsx, .mjs, .cjs).

This allows us to write TypeScript code that can be run in-place and then compiled into JavaScript when we’re ready.
"

With this option is doesn't matter if `--allowImportingTsExtensions` is used or not. If not used, it won't stop us from import ts files, because they will be rewritten to js.

More details:
- https://github.com/microsoft/TypeScript/pull/59767
- https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/#path-rewriting-for-relative-paths

