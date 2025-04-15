# A template for monorepos

A template to quickstart new projects at 2adapt.

# Assumptions about the server

- Ubuntu >= 24.04 (or some close cousin) 
- DNS records are configured correctly for the associated domain (an "A record")
- The following stuff should be installed in the server (via `apt` or some standalone installer):
	- Nix: https://github.com/DeterminateSystems/nix-installer
		- verify: `which nix; which nix-shell; nix --version;`
	- Caddy: https://caddyserver.com/docs/install#debian-ubuntu-raspbian
		- verify: `which caddy; sudo systemctl status caddy; caddy version;`
	- PostgreSQL: https://www.postgresql.org/download/linux/ubuntu/
		- verify: `ls -l /etc/postgresql; sudo systemctl status postgresql;`
	- pnpm (?): https://pnpm.io/installation#on-posix-systems
		- DEPRECATED! pnpm is now available via nix, using the `corepack` nix package
    - the `2adapt` group is created; users in that group can manage the `/opt/2adapt` directory
      - verify: `ls -l /opt;` (we should see `drwxrwsr-x 2 root 2adapt 12:34 2adapt2`)

		

# Initial configuration:

## Create the application user and fetch the repo 

```bash
# create a (regular) user for the application; add to the "2adapt" group;

APP_USER="app_user"
sudo adduser ${APP_USER}
sudo usermod --append --groups 2adapt ${APP_USER}

# it might be necessary to logout/login to see the updated list of groups with the `groups` command
groups ${APP_USER}

# login with the new user; verify that app_user is able to create stuff in /opt/2adapt 
mkdir /opt/2adapt/temp
ls -l /opt/2adapt
rmdir /opt/2adapt/temp

#  manually clone the git repo; we assume that the ssh keys are already set up for this user
cd /opt/2adapt
git clone git@github.com:2adapt/projectname.git
```

## Set the necessary env variables and enter the nix shell: 

```bash
cp config/env.sh.template config/env.sh
emacs config/env.sh
nix-shell
```

## Create the database for the project:

```bash
export PGUSER_FOR_PROJECT="app_user";
export PGDATABASE_FOR_PROJECT="$PGUSER_FOR_PROJECT";

# 2.1 - create a database user: normal user or super user:

# 2.1a - a normal user...
sudo --user postgres \
createuser --echo --no-createdb --inherit --login  --pwprompt --no-createrole --no-superuser --no-bypassrls --no-replication ${PGUSER_FOR_PROJECT}

# 2.1b - or a superuser
sudo --user postgres \
createuser --echo --superuser --pwprompt ${PGUSER_FOR_PROJECT}

# 2.2 - create the respective database
sudo --user postgres \
createdb --owner=${PGUSER_FOR_PROJECT} --echo ${PGDATABASE_FOR_PROJECT}

# if necessary, manually install extensions that must be installed by a database superuser:
# postgis;
# postgis_raster;
# postgis_topology;
# postgis_sfcgal;
# postgis_topology;
# dblink;
# file_fdw;
# postgres_fdw;
# pg_stat_statements;

# example: this will also install "postgis", because of "cascade"
sudo --user postgres \
psql --dbname=${PGDATABASE_FOR_PROJECT} --command="CREATE EXTENSION IF NOT EXISTS postgis_raster CASCADE;"

# 2.3 - make sure we can connect; by default it will connect to a database 
# with the same name as the username (so --dbname could be omitted below);
psql --host=localhost --dbname=${PGUSER_FOR_PROJECT} --username=${PGUSER_FOR_PROJECT} 

# alternative: if the following PG* env variables are set, psql will use them: 
# PGHOST, PGDATABASE, PGUSER, PGPASSWORD;
# so we now should set those variables in config/env.sh, enter in the nix shell 
# and verify again:
echo $PGHOST,$PGDATABASE,$PGUSER,$PGPASSWORD
psql

# 2.4 - create a table and insert some values
psql --command="create table test(id int, name text)";
psql --command="insert into test values (1, 'aaa')";
psql --command="insert into test values (2, 'bbb')";
```


## Start the nix shell and install dependencies from npm (with pnpm):

```bash
# classic nix shell...
nix-shell
  
# modern nix shell
nix develop  

# install the dependencies with pnpm; make sure that $PWD is at the $PROJECT_ROOT_DIR;  
if [ $PWD == $PROJECT_ROOT_DIR ]; then echo "ok!"; fi

# if we are in production: after pnpm has finished, make sure that `pnpm-lock.yaml` 
# was not modified (it shouldn't if we have `CI="false"` in `config/env.sh`)

pnpm install

```

## Verify that the SvelteKit webapp can be built and started:

```bash
cd ${PROJECT_ROOT_DIR}/packages/webapp
pnpm run build
node build/index.js

# at this point we should have a node server for the the webapp available at http://localhost:${WEBAPP_PORT}
```

## Configure DNS and import the project's Caddyfiles in the global Caddyfile

```bash
sudo emacs /etc/caddy/Caddyfile
# see details in section 1.3 and config/caddy/README.md

sudo systemctl restart caddy

# at this point we should have the webapp available at https://${PROJECT_HOSTNAME}
curl --insecure https://${PROJECT_HOSTNAME}
```


## Verify that the api server can be started:

```bash
cd ${PROJECT_ROOT_DIR}/packages/api
pnpm run start
```

## Configure the systemd services 

Details here: `config/systemd/README.md`


# Steps for the reconstruction of the template - How did we arrive here?

## 1 - Create the initial monorepo structure, to be managed by `pnpm` and `nix`:

### Basic configuration files at the project root dir

```bash
# "A workspace must have a pnpm-workspace.yaml file in its root."
# https://pnpm.io/workspaces
pwd

touch pnpm-workspace.yaml
touch .npmrc
touch .gitignore
```

### nix files: `config/nix`

```bash
mkdir -p config/nix

touch config/nix/flake.nix
touch config/nix/shell.nix

# the env variables in this file will be loaded when the nix shell starts (below)
touch config/env.sh.template
```

It's convenient to have a shortcut for `config/nix/flake.nix` and `config/nix/shell.nix` in the project base directory:

```bash
# note that we actually want the symlink to have a relative path
ln --symbolic ./config/nix/flake.nix flake.nix
ln --symbolic ./config/nix/shell.nix shell.nix

# to enter the devshell using the new nix cli it's necessary that flake.nix is already part of the repo
git add flake.nix
git add ./config/nix/flake.nix 

# we can now enter the devshell
nix-shell # or using the classic nix cli
nix develop # using the new nix cli and flakes
```

### caddy files: `config/caddy`

```bash
mkdir -p config/caddy

touch config/caddy/Caddyfile-main
touch config/caddy/Caddyfile-dev
touch config/caddy/Caddyfile-log
touch config/caddy/Caddyfile-vite
touch config/caddy/Caddyfile-static-webapp
```

For local development: update the `/etc/hosts` to have a local domain:

```bash
sudo emacs /etc/hosts
```

Append a line like this:

```
...
127.0.0.1 the-domain.local
```

The global Caddyfile should import the project Caddyfile:

```bash
sudo emacs /etc/caddy/Caddyfile
```

```
# add a new site block

the-domain.local {

	# args[0] = WEBAPP_PORT = 5000
	# args[1] = API_PORT = 5001
	# args[2] = PROJECT_ROOT_DIR = "/path/to/project-root-dir"
	import /path/to/project-root-dir/config/caddy/Caddyfile-main 5000 5001 "/path/to/project-root-dir"
	
	# args[0] = PROJECT_HOSTNAME = "the-domain.local"
	# import /path/to/project-root-dir/config/caddy/Caddyfile-log "the-domain.local"
	
	# import /path/to/project-root-dir/config/caddy/Caddyfile-dev "/path/to/project-root-dir"
	# import /path/to/project-root-dir/config/caddy/Caddyfile-vite 5000
	# import /path/to/project-root-dir/config/caddy/Caddyfile-prod "/path/to/project-root-dir"
}

```

Caddy must be reloaded after the global Caddyfile (or one of the included Caddyfiles) are modified:

```bash
sudo systemctl reload caddy
sudo systemctl status caddy

# check for errors
journalctl -xeu caddy.service

```

A common error might be this:

>"File to import not found: /path/to/file/Caddyfile-main, at /etc/caddy/Caddyfile:999"

This will happen is the directory where "Caddyfile-main" is located (or any of the parent directories) does not have permission for the caddy process to access it (for instance, if it is `drwxr-x---`).

It can solved by adding the "caddy" user to the group associated to the directory:

```shell
DIRECTORY_GROUP=...
sudo usermod --append --groups ${DIRECTORY_GROUP} caddy

# verify that "caddy" is now part of the group
getent group ${DIRECTORY_GROUP}
```

We should now be able to load the webapp using `https://the-domain.local/caddy-debug/hello` (see step 3)

NOTE: in some cases the "hot reload" in SvelteKit doesn't seem to work well with these local domains.

### systemd services files: `config/systemd`

```bash
mkdir -p config/systemd

touch config/systemd/projectname-webapp.service
touch config/systemd/projectname-restart.sh
touch config/systemd/projectname-status.sh
touch config/systemd/projectname-stop.sh
```

Add the command to sudoers.

sudo visudo
projectuser ALL=(root) NOPASSWD: /bin/ls -l /root

/etc/sudoers.d/

## 2 - Basic monorepo management with `pnpm`

### Create a workspace package

Reference: https://pnpm.io/workspaces

A sub-directory in `$PROJECT_ROOT_DIR/packages` is a "workspace package".

```bash
mkdir -p ${PROJECT_ROOT_DIR}/packages/dummy-1
cd ${PROJECT_ROOT_DIR}/packages/dummy-1

# initialize the `dummy-1` workspace package (create a package.json) and install a module from npm:
pnpm init
pnpm add underscore

# observe the effect on package.json and in the structure of the monorepo
cat ./package.json
ls -la ./node_modules

cat ../../pnpm-lock.yaml 
ls -la ../../node_modules

# return to the workspace root dir
cd ../..
```

At this point:

- `pnpm` should have created `pnpm-lock.yaml` and `node_modules` in the project/workspace base dir
- this `node_modules` in the base dir has a `.pnpm` subdirectory (hidden directory), which is where the modules used in our workspace packages are actually stored
- a symlink is created from `packages/dummy-1/node_modules/underscore` to the respective directory in `node_modules/.pnpm`.

IMPORTANT: before installing a dependency for a workspace package (`pnpm add <some-pkg>`) we should always change the working directory so that we are in the directory of that workspace package; that is, we should do this:

```bash
cd ${PROJECT_ROOT_DIR}/packages/dummy-1
pnpm add <some-pkg>
```

Otherwise we end up with a `package.json` in the workspace base dir, which we don't want.

### Use an existing local workspace package as a dependency

A package in the workspace can also be used as a dependency:

```bash
mkdir -p ${PROJECT_ROOT_DIR}/packages/dummy-2
cd ${PROJECT_ROOT_DIR}/packages/dummy-2
pnpm init

# assuming that the "dummy-1" local package was created before, we can now use it as a dependency
pnpm add dummy-1 --workspace

# observe the internal linking done by pnpm
cat ./package.json
ls -l node_modules/
cat ../../pnpm-lock.yaml | grep --context=9 dummy-2
```

### Use `pnpx`

- `pnpx` is an alias for `pnpm dlx`: https://pnpm.io/cli/dlx
- `pnpm dlx` is equivalent to `npx`: https://pnpm.io/feature-comparison
- so `pnpx` is equivalent to `npx`

These commands are equivalent:

```shell
pnpx create-something@1.2.3
pnpm dlx create-something@1.2.3

# for the "create-*" packages, this is also also equivalent:
pnpm create something@1.2.3
```

A concrete example with `pnpx`:

```shell
# https://github.com/http-party/http-server
pnpx http-server --port 5000 --cors
```


## 3 - SvelteKit

Reference: https://kit.svelte.dev/docs/creating-a-project

SvelteKit should be used with svelte@5, but we can still install the svelte@4.

SvelteKit with svelte@5: use the "sv" cli
https://github.com/sveltejs/cli
https://svelte.dev/blog/sv-the-svelte-cli

```bash
mkdir -p ${PROJECT_ROOT_DIR}/packages/webapp
cd ${PROJECT_ROOT_DIR}/packages/webapp

pnpx sv help

# create a new project; choose these options: demo template; eslint; tailwindcss; sveltekit-adapter (node adapter) 
pnpx sv create --no-install
pnpm install
pnpm add @poppanator/sveltekit-svg --save-dev
pnpm run dev
```

SvelteKit with svelte@4: use the `create-svelte` package
https://github.com/sveltejs/kit/tree/main/packages/create-svelte

```bash
mkdir -p ${PROJECT_ROOT_DIR}/packages/webapp-svelte4
cd ${PROJECT_ROOT_DIR}/packages/webapp-svelte4

# create a new project; choose these options: demo app; eslint;
pnpx create-svelte@6 # explicitely use v6 because it's the latest version that works
pnpm install
pnpm add @sveltejs/adapter-node
pnpm add @poppanator/sveltekit-svg@4 --save-dev


# we should have svelte@4.2.19 and @sveltejs/kit@latest
pnpm run dev
```

### Adjustments to the original demo app

We make some adjustments in the files below. To see the original contents create a new project.

#### `vite.config.js`

- create an empty `config` object and add properties one by one 
- add `config.server` and `config.build`
- add a vite plugin to import svg files directly

#### `svelte.config.js`

- modified `config.kit.adapter` to use `adapter-node`
- add `config.kit.addDir` to handle a custom static assets dir 
  - it's necessary to create this subdir: `mkdir static/static-webapp` 
- add `config.kit.typescript`
- add `config.compilerOptions`
- add `config.preprocess` (for tailwindcss)
- add `config.onwarn`

#### `src/static`:

All static assets should be placed instead in `src/static/static-webapp`

#### `src/app.html`:

- add the Inter font (reference: https://tailwindcss.com/plus/ui-blocks/documentation#add-the-inter-font-family)
- disable the `data-sveltekit-preload-data` attribute
- maybe add `height:100%` to `html` and `body`? (via `h-full` from tailwind)
- maybe add `bg-gray-50` to `body`?
 
#### `src/error.html`:

- custom fallback error page
- https://svelte.dev/docs/kit/project-structure#Project-files
- https://svelte.dev/docs/kit/routing#error

#### `src/app.css`:

- add the 3 `@tailwind` directives

#### `src/routes/+layout.svelte`:

- add `<span class="debug-screens"></span>` (tailwind breakpoints)

#### `routes/test/*` 

Add new routes to test features from sveltekit that are not in the demo.

#### `eslint.config.js`:

Disable some rules.

```js
export default ts.config(
	...
	{
		rules: {
			...
			// add these
			"prefer-const": "off",
			"@typescript-eslint/no-unused-vars": "off"
		}
	}
```

#### `tsconfig.json`:

Upgrade for a ts-only experience, with erasable syntax only.

```json
{
	"compilerOptions": {
		...
		// set to false?
		"checkJs": false
		...
		// add these
		"allowImportingTsExtensions": true,
		"erasableSyntaxOnly": true,
	}
}
```


### Install and configure TailwindCSS@3 for the SvelteKit app

NOTE: this is necessary only if we used `create-svelte` (that is, for svelte@4). The `sv` cli will use the new version of tailwindcss (v4)
that doesn't need a configuration file
- https://tailwindcss.com/blog/tailwindcss-v4#first-party-vite-plugin
- https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration

Reference: https://tailwindcss.com/docs/guides/sveltekit

```bash
# main packages for TailwindCSS (version 3, not 4!)

pnpm add tailwindcss@3 --save-dev
pnpm add postcss@8 --save-dev
pnpm add autoprefixer@10 --save-dev

# other useful plugins for tailwind  (tailwindUI, and others)
 
pnpm add @tailwindcss/aspect-ratio@0.4 --save-dev
pnpm add @tailwindcss/forms@0.5 --save-dev
pnpm add @tailwindcss/typography@0.5 --save-dev
pnpm add tailwind-scrollbar@3.1 --save-dev
pnpm add tailwindcss-debug-screens@2.2 --save-dev

# for daisyui@5 see https://daisyui.com/docs/v5 (requires tailwindcss@4)
# pnpm add daisyui@4.12 --save-dev

# initialize the the tailwind.config.js and postcss.config.js configuration files 
pnpx tailwindcss@3 init --esm --postcss
```

The `tailwind.config.js` file was customized with the plugins above and other stuff.


### Verify that the build is working

Reference: https://kit.svelte.dev/docs/adapter-node

We are using the node adapter (instead of the default auto adapter). Make a build and run it:

```bash
pnpm run build
# node --run build  # nodejs >= 22

# inspect the build output
ncdu build

# run
node build/index.js
```

The port of the application is read from a predefined env variable. By default it is `PORT`, but since the we have set `config.kit.adapter.envPrefix` as `"WEBAPP_"` in `svelte.config.js`, it should now be `WEBAPP_PORT` (which should be defined in `config/env.sh`)

```bash
WEBAPP_PORT=9999 node build/index.js
```

Other env variables that might be of interest: 

- `WEBAPP_HOST`
- `WEBAPP_ORIGIN` 
- `WEBAPP_BODY_SIZE_LIMIT`

NOTE: 
>"HTTP doesn't give SvelteKit a reliable way to know the URL that is currently being requested. If `adapter-node` can't correctly determine the URL of your deployment, you may experience this error when using form actions: "Cross-site POST form submissions are forbidden" 

https://kit.svelte.dev/docs/adapter-node#environment-variables-origin-protocolheader-hostheader-and-port-header







## 4 - Fastify

Reference: https://github.com/fastify/fastify-cli#generate

```bash

mkdir -p ${PROJECT_ROOT_DIR}/packages/api
cd ${PROJECT_ROOT_DIR}/packages/api

pnpx fastify-cli help
pnpx fastify-cli version

pnpx fastify-cli generate --help
pnpx fastify-cli generate --esm --lang=typescript .

# the "eject" command will create a "server.ts" file in the CWD; we can then run directly as a standalone server 
# (insted of using fastify-cli)  

cd src 
pnpx fastify-cli eject --help
pnpx fastify-cli eject --esm --lang=typescript

# install, review and update dependencies, if necessary

cd ..
pnpm install
pnpm list

# @fastify/autoload must be >= 6.2.0, to have proper typescript support
pnpm add @fastify/autoload@latest

# typescript must be >= 5.8
pnpm add typescript@latest

# we won't use ts-node; we'll use instead type stripping (built-in or ts-blank-space) 
pnpm remove ts-node
pnpm add ts-blank-space@latest
```

### Adjustments to `tsconfig.json` to fit our workflow (type erasure):

```json
  "compilerOptions": {
    [...]
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
  },
```

### Adjustments to `server.ts`:

```js
// we won't use dotenv; all env variables should be located in config/env.sh
// import * as dotenv from "dotenv";
// dotenv.config();

(...)

// all relative imports require explicit file extensions 
app.register(import("./app.ts"));

(...)

// we have our own env variable for the API port
app.listen({ port: parseInt(process.env.API_PORT || '500'))
```

### Adjustments to type imports:

```js
# since we are using "verbatimModuleSyntax", all type imports must have "type"
import {type AutoloadPluginOptions} from '@fastify/autoload';
```

### Check types with the official compiler

In practice we should not need to do this explicitely because the IDE should give us immediate 
feedback about errors as type; but we should do it sometimes to because AI agents or IDE refactores
might introduce some errors

```
# run rsc directly
./node_modules/.bin/tsc --noEmit

# or via `pnpx exec`
pnpm exec tsc --noEmit
```

### Run directly, with compiling (using type stripping)

For nodejs >= 22.6 we use the built-in type stripping:

```
node --experimental-strip-types src/server.ts
```

For nodejs < 22.6 we use `ts-blank-space` as loader:

```
# https://github.com/fastify/fastify-autoload#override-typescript-detection-using-an-environment-variable
"If FASTIFY_AUTOLOAD_TYPESCRIPT is truthy, Autoload will load .ts files, expecting that node has a ts-capable loader."

FASTIFY_AUTOLOAD_TYPESCRIPT=1 node --import ts-blank-space/register src/server.ts
```

NOTE: the built-in type stripping won't work for `.ts` files inside `node_modules`; so we  might 
actually prefer to use `ts-blank-space`, even for nodejs >= 22.6.

### Build

Since we are using only typescript that can be erased, the build step is actually not necessary. We can start node directly and all typescript will be removed on the fly. 

Build with `tsc`:

```
# this should fail because we are using `allowImportingTsExtensions: true`; set to false for the build;
rm -rf ./dist && ./node_modules/.bin/tsc
```

Build with `ts-blank-space` (TO BE DONE)

```
rm -rf ./dist && pnpm run build:blank-space
```

### Recreate the `script` configuration in `package.json`

```
  "scripts": {
    "dev": "node --watch --experimental-strip-types src/server.ts",
    "dev-node20": "FASTIFY_AUTOLOAD_TYPESCRIPT=1 node --watch --import ts-blank-space/register src/server.ts",
    "start": "node --experimental-strip-types src/server.ts",
    "start-node20": "FASTIFY_AUTOLOAD_TYPESCRIPT=1 node --import ts-blank-space/register src/server.ts",
    "test-ORIGINAL": "...",
  },
```

Create a plugin with `fastify-cli`:

```bash
NOTE: the output will be too opinionated, and doesn't seem to support the 
"--esm --lang=typescript" options; but might be useful as a starting point;

pnpx fastify-cli generate-plugin --help
pnpx fastify-cli generate-plugin src/plugins/the-plugin
```

### https://github.com/fastify/demo/


    "@fastify/cookie": "^11.0.1",
    "@fastify/cors": "^11.0.0",
    "@fastify/env": "^5.0.1",
    "@fastify/helmet": "^13.0.0",
    "@fastify/multipart": "^9.0.1",
    "@fastify/rate-limit": "^10.0.1",
    "@fastify/sensible": "^6.0.1",
    "@fastify/session": "^11.0.1",
    "@fastify/static": "^8.0.2",
    "@fastify/swagger": "^9.0.0",
    "@fastify/swagger-ui": "^5.0.1",
