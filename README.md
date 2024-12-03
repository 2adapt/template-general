# A template for monorepos

A template to quickstart new projects at 2adapt.

# Assumptions about the server

- Ubuntu >= 22.04 (or some close cousin) 
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

## 0 - create the application user and fetch the repo 

```bash
# 1 - create a (regular) user for the application; add to the "2adapt" group;

APP_USER="app_name"
sudo adduser ${APP_USER}
sudo usermod --append --groups 2adapt ${APP_USER}
groups ${APP_USER}

# note: if we do a usermod for our own user, it's necessary to logout/login
# to see the effect of the new group in the "groups" command; 
# or in alternative, re-login with ssh in the localhost

# 2 - now login with the new user, we should now be able to create stuff; 

mkdir /opt/2adapt/temp
ls -l /opt/2adapt
rmdir /opt/2adapt/temp

# 3 - manually clone the git repo

cd /opt/2adapt
git clone git@github.com:2adapt/app_name.git
```

## 1 - set the necessary env variables and enter the nix shell: 
```bash
cp config/env.sh.template config/env.sh
emacs config/env.sh
nix-shell
```

## 2 - create the database for the project:

```bash
export PGUSER_FOR_PROJECT="app_name";
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
# postgis; postgis_raster; postgis_topology; postgis_sfcgal; postgis_topology; dblink; file_fdw; postgres_fdw; pg_stat_statements;

# example: this will also install "postgis", because of "cascade"
sudo --user postgres \
psql --dbname=$PGDATABASE_FOR_PROJECT --command="CREATE EXTENSION IF NOT EXISTS postgis_raster CASCADE;"

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


## 4 - enter the nix dev shell and install dependencies from npm:

```bash
# 3a - classic nix cli...
nix-shell  
# 3b - or modern nix cli
nix develop  

# install the dependencies with pnpm; make sure that $PWD is at the $PROJECT_HOME_DIR;  
if [ $PWD == $PROJECT_HOME_DIR ]; then echo "ok!"; fi

# if we are in production: after pnpm has finished, make sure that `pnpm-lock.yaml` 
# was not modified (it shouldn't if we have `CI="false"` in `config/env.sh`)

pnpm install

```

## 5 - verify that the SvelteKit webapp can be built and started:

```bash
cd packages/webapp

# 4a - check dev mode
pnpm run dev # or "node --run dev"


# 4b - prod mode
pnpm run build # or "node --run build"
 
node build/index.js

# at this point we should have the webapp working on http://localhost:${WEBAPP_PORT}
```

## 5 - configure DNS and import the project's Caddyfiles in the global Caddyfile (see details in section 1.3 and config/caddy/README.md)

```bash
sudo emacs /etc/caddy/Caddyfile
# edit the global caddyfile
sudo systemctl restart caddy

# at this point we should have the webapp working on https://${PROJECT_HOSTNAME}
```


## 6 - verify that the api server can be started:
```bash
cd packages/api
node src/server.js  # TODO: add this as a "run" command in package.json
```

## 7 - create the systemd service 

Details here: `config/systemd-units/readme.md`




# Template steps

## 1 - Create the initial monorepo structure, to be managed by `pnpm` and `nix`:

### 1.1 - Basic configuration files

```bash
# verify that the working directory is the workspace root directory/project base dir
pwd

touch .gitignore
touch pnpm-workspace.yaml
touch .npmrc
```

### 1.2 - nix files

```bash
mkdir -p config/nix

touch config/nix/flake.nix
touch config/nix/shell.nix

# the env variables in this file will be loaded abd available in the nix shell (below)
touch config/env.sh.template
```

It's convenient to have a shortcut for `config/nix/flake.nix` and `config/nix/shell.nix` in the project base directory:

```bash
# note that we actually want the symlink to have a relative path
ln -s ./config/nix/flake.nix flake.nix
ln -s ./config/nix/shell.nix shell.nix

# to enter the devshell using the new nix cli it's necessary that flake.nix is already part of the repo
git add flake.nix
git add ./config/nix/flake.nix 

# we can now enter the devshell
nix develop # using the new nix cli and flakes
nix-shell # or using the classic nix cli
```

## 1.3 - caddy files

```bash
mkdir -p config/caddy

touch config/caddy/Caddyfile-main
```

For local development: update the `/etc/hosts` to have a local domain:

```bash
sudo emacs /etc/hosts
```

Append a line like this:

```
127.0.0.1 the-domain.local
```

NOTE: in some cases the "hot reload" in SvelteKit doesn't seem to work well with these local domains.

The global Caddyfile should import the project Caddyfile:

```bash
sudo emacs /etc/caddy/Caddyfile
```

```

# add a new site block

the-domain.local {

	# args[0] = WEBAPP_PORT = 5000
	# args[1] = API_PORT = 5001
	# args[2] = PROJECT_HOME_DIR = "/path/to/project-home-dir"

	import /path/to/project-home-dir/config/caddy/Caddyfile-main 5000 5001 "/path/to/project-home-dir"
	import /path/to/project-home-dir/config/caddy/Caddyfile-log "the-domain.local"
	import /path/to/project-home-dir/config/caddy/Caddyfile-dev "/path/to/project-home-dir"
	import /path/to/project-home-dir/config/caddy/Caddyfile-vite 5000
	# import /path/to/project-home-dir/config/caddy/Caddyfile-prod "/path/to/project-home-dir"
}

```

Caddy must be reloaded after the global Caddyfile (or one of the included Caddyfiles) are modified:

```bash
sudo systemctl reload caddy
sudo systemctl status caddy
```

We should now be able to load the webapp using `https://the-domain.local/caddy-debug/hello` (see step 3)



## 2 - Monorepo management with `pnpm`

### 2.1 - Create a workspace package

Reference: https://pnpm.io/workspaces

A directory in `./packages` is a "workspace package".

```bash
mkdir -p packages/dummy-1
cd packages/dummy-1

# initialize the `dummy-1` workspace package (create a package.json) and install a module from npm:
pnpm init
pnpm add underscore

# observe the effect on package.json and in the structure of the monorepo
cat ./package.json

# created or updated by pnpm
cat ../../pnpm-lock.yaml 
ls -la ../../node_modules

# return to the workspace root/project base dir
cd ../..
```

At this point:

- `pnpm` should have created `pnpm-lock.yaml` and `node_modules` in the project/workspace base dir
- this `node_modules` in the base dir has a `.pnpm` subdirectory (hidden directory), which is where the modules used in our workspace packages are actually stored
- a symlink is created from `packages/dummy-1/node_modules/underscore` to the respective directory in `node_modules/.pnpm`.

IMPORTANT: before installing a dependency for a workspace package (`pnpm add <some-pkg>`) we should always change the working directory so that we are in the directory of that workspace package; that is, we should do this:

```bash
cd packages/dummy-1
pnpm add <some-pkg>
```

Otherwise we end up with a `package.json` in the workspace base dir, which we don't want.

### 2.2 - Using an existing local workspace package as a dependency

A package in the workspace can also be used as a dependency:

```bash
mkdir -p packages/dummy-2
cd packages/dummy-2
pnpm init

# assuming that packages/dummy-1 was created before, we can now use it as a dependency
pnpm add dummy-1 --workspace

# observe the internal linking done by pnpm
cat ./package.json
ls -l node_modules/
cat ../../pnpm-lock.yaml | grep --context=9 dummy-2
```


## 3 - SvelteKit

Reference: https://kit.svelte.dev/docs/creating-a-project

```bash
mkdir -p packages/webapp
cd packages/webapp

# note: `pnpx` is an alias for `pnpm dlx` (and `pnpm dlx` is equivalent to `npx`)
# choose "skeleton project", "jsdoc", "eslint" and "prettier"
pnpx create-svelte@6

# equivalent: pnpm dlx create-svelte@6
# equivalent: pnpm create svelte@6

pnpm install

# if necessary, add extra packages
pnpm add @sveltejs/adapter-node @poppanator/sveltekit-svg --save-dev

# run in dev mode
pnpm run dev
# node --run dev  # nodejs >= 22
```

This template has adjustments to (or adds) these files:

- `vite.config.js`
- `svelte.config.js`
- `src/static` (all static assets should be placed instead in `src/static/static-webapp`)


### 3.1 - Install TailwindCSS in the SvelteKit app

Reference: https://tailwindcss.com/docs/guides/sveltekit

```bash
# main packages for TailwindCSS
pnpm add tailwindcss postcss autoprefixer --save-dev

# other useful plugins that we use (tailwindUI, and others)
pnpm add @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio tailwind-scrollbar tailwindcss-debug-screens daisyui --save-dev

# initialize the the tailwind.config.js and postcss.config.js configuration files 
# note: `pnpx` is an alias for `pnpm dlx` (and `pnpm dlx` is equivalent to `npx`)
pnpx tailwindcss init --esm --postcss
```

This template has adjustments to (or adds) these files:

- `tailwind.config.js`
- `src/app.css`
- `src/routes/+layout.svelte`

In `src/app.html` we might have to do a few more small adjustments:

- add the Inter font: https://github.com/rsms/inter (details here: https://tailwindui.com/documentation#getting-set-up)
- add `height:100%` to the `html` and `body` elements (via `h-full` from tailwind)
- add `bg-gray-50` to the `body` element
- remove/disable the `data-sveltekit-preload-data` attribute


### 3.2 - Verify that the build is working

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

- `HOST`
- `ORIGIN` 
- `BODY_SIZE_LIMIT`

NOTE: 
>"HTTP doesn't give SvelteKit a reliable way to know the URL that is currently being requested. If `adapter-node` can't correctly determine the URL of your deployment, you may experience this error when using form actions: "Cross-site POST form submissions are forbidden" 

https://kit.svelte.dev/docs/adapter-node#environment-variables-origin-protocolheader-hostheader-and-port-header







## 4 - API

Reference: https://github.com/fastify/fastify-cli?tab=readme-ov-file#generate

```bash

mkdir -p packages/api
cd packages/api

# fastify-cli can be used without an explicit install using `pnpx`/`npx`
# note: `pnpx` is an alias for `pnpm dlx` (and `pnpm dlx` is equivalent to `npx`)

pnpx fastify-cli generate --help
pnpx fastify-cli generate . --esm
pnpm install

# run in dev mode (has watch mode and pino-pretty logging)
pnpm run dev
# node --run dev  # nodejs >= 22

# run in production mode (doesnt not have watch mode and pino-pretty logging)
pnpm run start
# node --run start  # nodejs >= 22

# use the explicit path to the fastify cli; this will start the main plugin (which will load all the other plugins via `@fastify/autoload`)
node_modules/.bin/fastify start --watch --port 4000 --options app.js

# we can also start just one specific plugin:
node_modules/.bin/fastify start --watch --port 4000 --options plugins/my-plugin.js

# we can give option for the plugin (received in the second parameter of the plugin function)
node_modules/.bin/fastify start --watch --port 4000 --options plugins/my-plugin.js -- --plugin-option=abc



```



Create a plugin with `fastify-cli`:

NOTE: the output will be too opinionated.

```bash
pnpx fastify-cli generate-plugin --help
pnpx fastify-cli generate-plugin the-plugin

```





 




--------------------------------------------------------------------------



# TO BE REVIEW: from here

# setup the api server (hapi)

```bash
pnpm create @hapipal api  # equivalent to: npm init @hapipal api
pnpm --filter="./api" install
```

install other dependencies
```bash
pnpm --filter="./api" add nodemon
pnpm --filter="./api" --workspace add postgres-connection 
```

in the scripts section of `api/package.json`, add a new `dev` script:
```bash
...
"scripts": {
	"dev": "nodemon server",
	"start": "node server",
	...
}
```


start in dev mode:
```
cd api
pnpm run dev
```
or start directly from the workspace root directory / base directory:
```
pnpm --filter="./api" run dev
```



# other notes (to be reviewed)

