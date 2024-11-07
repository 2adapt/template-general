# Typescript playground

## Using nodejs built-in experimental option

Added in v22.6: https://nodejs.org/api/typescript.html#type-stripping

```shell
node \
--watch \
--experimental-strip-types \
--disable-warning=ExperimentalWarning \
src/main.ts
```

related cli option: `--experimental-transform-types`


## Using Typescript official compiler

`tsconfig.json` taken from `ts-blank-space`:

```json
{
  "compilerOptions": {
    "strict": true,
    
    // use "esnext" to emit JS syntax untouched
    "target": "esnext",
    //"target": "es5",
    // "target": "es2022",
    
    // class fields are preserved as written which corresponds to 'define' semantics in the ECMAScript
    // "useDefineForClassFields": true,
    
    // "any imports or exports without a type modifier are left around. Anything that uses the type modifier is dropped entirely."; "what you see is what you get."
    "verbatimModuleSyntax": true,
    
    // "module": "esnext",
    "allowImportingTsExtensions": true
  },
  "include": ["src/main.ts"],
}
```

```shell
pnpm add typescript

# when a .ts file is given at the end, the tsconfig.json will be ignored 
# (that is, some default compiler options will be used instead)

./node_modules/.bin/tsc --noEmit src/main.ts
./node_modules/.bin/tsc src/main.ts

# to actually use the tsconfig.json: add "--project path/to/dir" or 
# "--project path/to/dir/tsconfig.json", or simply don't add anything!

./node_modules/.bin/tsc --noEmit

# the "--watch" option might be useful

./node_modules/.bin/tsc --noEmit --watch
```



## Using Deno 2

```shell
deno run --watch --check src/main.ts

# see more details about the options:

deno run --help
```


## Using a bundler

### tsup

https://github.com/egoist/tsup

```shell
./node_modules/.bin/tsup --help

./node_modules/.bin/tsup src/main.ts \
--out-dir build \
--format esm,esm \
--clean

```



## Using external typescript runners (in principle, no type check is done)

https://github.com/privatenumber/ts-runtime-comparison

### ts-blank-space

https://github.com/bloomberg/ts-blank-space

- some context: https://x.com/acutmore/status/1836762324452975021
- more context: 10 Insights from Adopting TypeScript at Scale https://www.bloomberg.com/company/stories/10-insights-adopting-typescript-at-scale/
- Learnings from ts-blank-space https://gist.github.com/acutmore/27444a9dbfa515a10b25f0d4707b5ea2
- in practice this approach is also done by the nodejs with `--experimental-strip-types`; details here:
  - https://x.com/jalik26/status/1836804296416895025
  - SWC has implented a mode which follows the same approach: https://github.com/swc-project/swc/pull/9144 (also available on line, when the "Strip Types Only" option is used:  https://swc.rs/playground) 

```shell
pnpm add ts-blank-space
node --import=ts-blank-space/register ./src/main.ts
```

### tsx

https://github.com/privatenumber/tsx

```shell
pnpm add tsx
node --import tsx src/main.ts
```


### Jiti

https://github.com/unjs/jiti

```shell
pnpm add jiti
node --import jiti/register src/main.ts
```

### sucrase

https://github.com/alangpierce/sucrase

```shell
pnpm add sucrase
node --require=sucrase/register src/main.ts
```

### tsm

https://github.com/lukeed/tsm

- doesn't seem to be working
- not maintained?

```shell
pnpm add tsm
node --import tsm src/main.ts
```

### tsimp

https://github.com/tapjs/tsimp

- this one does type checking!
- but does not seem to be maintained anymore: https://github.com/tapjs/tsimp/issues/29

```shell
pnpm add tsimp
node --import=tsimp/import src/main.ts
```