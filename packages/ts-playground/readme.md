# Typescript playground

## 1 - Typescript official compiler

```shell
pnpm add typescript 

# we might have to install this
pnpm add @types/node


# when a .ts file is given at the end, the tsconfig.json will be ignored 
# (which means the default compiler options will be used instead)

./node_modules/.bin/tsc --noEmit src/00-main.ts

# to actually use the tsconfig.json: add "--project path/to/dir" or 
# "--project path/to/dir/tsconfig.json", or simply don't add anything!

./node_modules/.bin/tsc --noEmit

# the "--watch" option might be useful

./node_modules/.bin/tsc --noEmit --watch
```


## 2 - nodejs built-in experimental options for type erasure

- Added in v22.6: https://nodejs.org/api/typescript.html#type-stripping
- https://nodejs.org/api/typescript.html#type-stripping
- https://nodejs.org/api/cli.html#--experimental-strip-types
- related cli option: `--experimental-transform-types`

```shell
node \
--watch \
--experimental-strip-types \
--disable-warning=ExperimentalWarning \
src/00-main.ts
```

## 3 - Deno

https://docs.deno.com/runtime/fundamentals/typescript/

When using the `deno run` command, Deno will skip type-checking and run the code directly. In order to perform a type check of the module before execution occurs, you can use the `--check` flag

```shell
deno run --watch --check src/00-main.ts

# see more details about the options:

deno run --help
```


## 4 - Using a bundler

### tsup

- the simplest and fastest way to bundle TypeScript libraries
- powered by esbuild
 
https://github.com/egoist/tsup

```shell
pnpm add tsup

./node_modules/.bin/tsup --help

./node_modules/.bin/tsup src/00-main.ts \
--out-dir build \
--format esm,esm \
--clean

```



## 5 - Using external typescript runners (in principle, no type check is done)

https://github.com/privatenumber/ts-runtime-comparison

### ts-blank-space

https://github.com/bloomberg/ts-blank-space

- does type erasure but keeping the exact line numbers!
- simple and minimal; no dependencies except for the official compiler
- some context here: https://x.com/acutmore/status/1836762324452975021
- more context
  - 10 Insights from Adopting TypeScript at Scale https://www.bloomberg.com/company/stories/10-insights-adopting-typescript-at-scale/
  - Learnings from ts-blank-space https://gist.github.com/acutmore/27444a9dbfa515a10b25f0d4707b5ea2
  - in practice this approach is also done by the nodejs with the new `--experimental-strip-types`; details here:
    - https://x.com/jalik26/status/1836804296416895025
    - SWC has implemented a mode which follows the same approach: https://github.com/swc-project/swc/pull/9144 (also available on line, when the "Strip Types Only" option is used:  https://swc.rs/playground) 

```shell
pnpm add ts-blank-space

node --import=ts-blank-space/register ./src/00-main.ts
```

### tsx

https://github.com/privatenumber/tsx

- powered by esbuild


```shell
pnpm add tsx

node --import tsx src/00-main.ts
```

### sucrase

- very fast (?)
- sucrase's parser is forked from Babel's parser and trims it down to a focused subset of what Babel solves

https://github.com/alangpierce/sucrase

```shell
pnpm add sucrase

node --require=sucrase/register src/00-main.ts
```

### Jiti

https://github.com/unjs/jiti

```shell
pnpm add jiti

node --import jiti/register src/00-main.ts
```

### tsimp

https://github.com/tapjs/tsimp

- this one does type checking!
- does not seem to be maintained anymore: https://github.com/tapjs/tsimp/issues/29

```shell
pnpm add tsimp

node --import=tsimp/import src/00-main.ts
```

### tsm

https://github.com/lukeed/tsm

- doesn't seem to be working
- not maintained?

```shell
pnpm add tsm

node --import tsm src/00-main.ts
```
