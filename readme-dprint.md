### Initialize

 ```shell
 dprint init
 ```

### WebStorm - Multiple `dprint.json` configuration files in the project

`dprint` will use the local `dprint.json` configuration (example: `packages/api/dprint.json`) if we format directly from the command line:

 ```shell
 dprint fmt **/*.js
 ```

However it won't be used by WebStorm if we use format from the context menu (or auto-format on save). In that case it seems to only use the `dprint.json` at the root of the project. This is a problem related to the webstorm plugin. In VSCode the local configuration is used.

More details here:

"Support multiple dprint.json configuration files"
https://github.com/dprint/dprint-intellij/issues/93

### Problems with sveltekit files (`src/routes/[something].svelte`)

"Files to format are not found if the path contains square brackets"
https://github.com/dprint/dprint/issues/920
https://github.com/dprint/dprint/issues/552

?is it working using the context menu?

A manual workaround is to use the command line to format the files.

```shell
dprint fmt src/routes/**/*.svelte
```

