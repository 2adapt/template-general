# A template for monorepos

A template to quickstart new projects at 2adapt.

# Assumptions about the server

- Ubuntu 22.04 or similar 
- the DNS is configured correctly for the associated domain (an "A record")
- The following stuff should be installed in the server (via `apt` or some standalone installer):
	- Nix: https://github.com/DeterminateSystems/nix-installer
		- `which nix; which nix-shell; nix --version`
	- Caddy: https://caddyserver.com/docs/install#debian-ubuntu-raspbian
		- `which caddy; sudo systemctl status caddy; caddy version`
	- PostgreSQL: https://www.postgresql.org/download/linux/ubuntu/
		- `ls -l /etc/postgresql; sudo systemctl status postgresql`
	- pnpm (?): https://pnpm.io/installation#on-posix-systems
		- DEPRECATED! pnpm is now available via nix, using the `corepack` nix package

# Initial steps:

1. set the necessary env variables: 
```bash
cp config/env.sh.template config/env.sh
emacs config/env.sh
```

2. create the database for the project:

```bash
export PGUSER_FOR_PROJECT="app_name";

# 2.1 - create a database user: normal user or super user:

# 2.1a - a normal user...
sudo --user postgres \
createuser --createdb  --inherit --login --no-createrole --no-superuser --pwprompt --echo ${PGUSER_FOR_PROJECT}

# 2.1b - or a superuser
sudo --user postgres \
createuser --superuser --pwprompt --echo ${PGUSER_FOR_PROJECT}

# 2.2 - create the respective database
sudo --user postgres \
createdb --owner=${PGUSER_FOR_PROJECT} --echo ${PGUSER_FOR_PROJECT}

# 2.3 - make sure we can connect; by default it will connect to a database 
# with the same name as the username (so --dbname could be omitted below);
psql --host=localhost --dbname=${PGUSER_FOR_PROJECT} --username=${PGUSER_FOR_PROJECT} 

# alternative: if the following PG* env variables are set, psql will use them: 
# PGHOST, PGDATABASE, PGUSER, PGPASSWORD;
# so we not should set those variables in config/env.sh, enter in the nix shell 
# and verify again:
echo $PGHOST,$PGDATABASE,$PGUSER,$PGPASSWORD
psql

# 2.4 - create a table and insert some values
psql --command="create table test(id int, name text)";
psql --command="insert into test values (1, 'aaa')";
psql --command="insert into test values (2, 'bbb')";
```


3. enter the nix dev shell and install dependencies from npm:

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

4. verify that the SvelteKit webapp can be built and started:
```bash
cd packages/webapp

# 4a - check dev mode
pnpm run dev # or "node --run dev"


# 4b - prod mode
pnpm run build # or "node --run build"
 
node build/index.js

# at this point we should have the webapp working on http://localhost:${WEBAPP_PORT}
```

5. configure DNS and import the project's Caddyfiles in the global Caddyfile (see details in section 1.3 and config/caddy/README.md)

```bash
sudo emacs /etc/caddy/Caddyfile
# edit the global caddyfile
sudo systemctl restart caddy

# at this point we should have the webapp working on https://${PROJECT_HOSTNAME}
```


6. verify that the api server can be started:
```bash
cd packages/api
node src/server.js  # TODO: add this as a "run" command in package.json
```

7. Create the systemd service 

See details in the "Systemd units" section ("Reload and activate the service")


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
pnpm create svelte@latest  # choose "skeleton project", "jsdoc", "eslint" and "prettier"
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

# initialize the the tailwind.config.js and postcss.config.js configuration files (`pnpm dlx` is equivalent to `npx`)
pnpm dlx tailwindcss init -p
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

# fastify-cli can be used without an explicit install using `pnpm dlx` or `npx`

pnpm dlx fastify-cli generate --help
pnpm dlx fastify-cli generate . --esm
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
pnpm dlx fastify-cli generate-plugin --help
pnpm dlx fastify-cli generate-plugin the-plugin

```








## 5 - Systemd units

Reference: ...

### Base configuration for a `app-name-webapp` service

Create the configuration file:

```bash
mkdir -p config/systemd-units/app-name-webapp
emacs config/systemd-units/app-name-webapp/app-name-webapp.service
```

Copy-paste:

```bash
# ...
```

Reload and activate the `app-name-webapp` service:

```bash

# make sure that $PWD is $PROJECT_HOME_DIR
if [ $PROJECT_HOME_DIR = $PWD ]; then echo "ok!"; fi


# verify that the files exist and that the contents are correct
ls -l "${PWD}/config/systemd-units/app-name-webapp/app-name-webapp.service"
cat "${PWD}/config/systemd-units/app-name-webapp/app-name-webapp.service"

sudo ln -s \
"${PWD}/config/systemd-units/app-name-webapp/app-name-webapp.service" \
"/etc/systemd/system/app-name-webapp.service"

# verify that the symlinks are correct
ls -l "/etc/systemd/system/app-name-webapp.service"
cat "/etc/systemd/system/app-name-webapp.service"

sudo systemctl daemon-reload
sudo systemctl enable "app-name-webapp.service"
sudo systemctl start "app-name-webapp.service"
```

Systemd will create a new link in `/etc/systemd/system/app-name-webapp.service` pointing to out `.service` file.

Other commands to interact with the `app-name-webapp` service:

```bash
sudo systemctl status "app-name-webapp.service"
journalctl --unit "app-name-webapp.service" --lines 500
sudo systemctl restart "app-name-webapp.service"
sudo systemctl start "app-name-webapp.service"
sudo systemctl stop "app-name-webapp.service"
sudo systemctl disable "app-name-webapp.service"
```


### Wrapper scripts for the `app-name-webapp` service

Create a wrapper for `status` subcommand using a simple shell script:

```bash
touch config/systemd-units/app-name-webapp/status.sh
chmod 755 config/systemd-units/app-name-webapp/status.sh
emacs config/systemd-units/app-name-webapp/status.sh
```

Copy-paste:

```
#!/bin/sh

sudo systemctl status "app-name-webapp"
```

We can now see the status of the `app-name-webapp` service using the shell script in the project:

```bash
sudo config/systemd-units/app-name-webapp/status.sh
```

If this makes sense we can repeat for other systemd subcommands: `restart` and `stop`.


### Wrapper scripts for all services

Similar to the above, but considering all services related to this project:

```bash
touch config/systemd-units/status-all.sh
chmod 755 config/systemd-units/status-all.sh
emacs config/systemd-units/status-all.sh
```

Copy-paste:

```
#!/bin/sh

sudo systemctl status "app-name-webapp"
sudo systemctl status "app-name-api"
sudo systemctl status "app-name-other"
```

We can now see the status of all services:

```bash
sudo config/systemd-units/status-all.sh
```


### Specific configuration for `app-name-webapp` (if necessary)

Add the missing options in the `[Service]` section using the `systemctl edit` command. More details here: https://www.linode.com/docs/guides/introduction-to-systemctl/#editing-a-unit-file

```bash
export SYSTEMD_EDITOR=emacs
sudo systemctl edit "app-name-webapp"
```

Add add something like this:

```bash

[Service]

User=...
WorkingDirectory=/path/to/project-home-dir-base-dir
ExecStart=/nix/var/nix/profiles/default/bin/nix-shell --run node packages/api/server.js

```

Any changes to the configuration files requires a reload and restart of the service:

```bash
sudo systemctl daemon-reload
sudo systemctl restart "app-name-webapp.service"
sudo systemctl status "app-name-webapp.service"
```

We should now have a new directory in `/etc/systemd/system/app-name-webapp.service.d`.





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

