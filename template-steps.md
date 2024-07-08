## 1 - Create the initial monorepo structure, to be managed by `pnpm` and `nix`:

### 1.1 - Basic configuration files (pnpm):

```shell
# verify that the working directory is the workspace root directory
pwd

touch .gitignore
touch pnpm-workspace.yaml
touch .npmrc
```

### 1.2 - nix files

```shell
mkdir -p config/nix

touch config/nix/flake.nix
touch config/nix/shell.nix

# the env variables in this file will be available in the nix shell (below)
touch config/env.sh.template
```

It's convenient to have a shortcut for `config/nix/flake.nix` and `config/nix/shell.nix` in the project root:

```shell
# note that we actually want the symlink to have a relative path
ln -s ./config/nix/flake.nix flake.nix
ln -s ./config/nix/shell.nix shell.nix

# to enter the devshell it's necessary that flake.nix is already part of the repo
git add ./config/nix/flake.nix 
git add flake.nix

# we can now enter the devshell
nix develop # using the new nix cli and flakes
nix-shell # using the classic nix cli
```

## 1.3 - caddy files

```shell
mkdir -p config/caddy

touch config/caddy/Caddyfile-dev
touch config/caddy/Caddyfile-prod
```

For local development we can update the `/etc/hosts` to have a local domain:

```shell
sudo emacs /etc/hosts
```

Append a lines similar to this:

```
127.0.0.1 the-domain.local
```

NOTE: sveltekit hot reload doesn't seem to work well with these local domains.

The main caddy configuration should import one of the files above:

```shell
sudo emacs /etc/caddy/Caddyfile
```

```

# add a new site block

http://the-domain.local {
	import /path/to/project-root/config/caddy/Caddyfile-dev
	#import /path/to/project-root/config/caddy/Caddyfile-prod
}

```

Caddy must be reloaded after the main caddyfile (or one of the included Caddyfiles) are changed:

```shell
sudo systemctl reload caddy
sudo systemctl status caddy
```

We should now be able to load the webapp using `http://the-domain.local` (see step 3)









## 2 - See the monorepo working

### 2.1 - Create a dummy package in the workspace

Reference: https://pnpm.io/workspaces

```shell
mkdir -p packages/dummy
cd packages/dummy

# initialize the `dummy` package (create a package.json) and install some module from npm:
pnpm init
pnpm add underscore
cd ../..
```

At this point:
- `pnpm` should have created `pnpm-lock.yaml` and `node_modules` in the project root
- this root `node_modules` has a `.pnpm` subdirectory, which is where the modules used in our monorepo packages are stored

Before using `pnpm add <pkg>` we should change the working directory to the monorepo package that will use that dependency (example: `packages/dummy`), to make sure that pnpm will not created a `package.json` in the project root.

### 2.2 - Add a dependency from the workspace

A package in the workspace can be used as a dependency for other packages in the workspace:

```shell
mkdir -p packages/dummy-2
cd packages/dummy-2
pnpm init
pnpm add dummy --workspace
cat ../../pnpm-lock.yaml | grep --context=9 dummy-2
```








## 3 - Initialize the sveltekit project

Reference: https://kit.svelte.dev/docs/creating-a-project

```shell
mkdir -p packages/webapp
cd packages/webapp
pnpm create svelte@latest
pnpm install

# if necessary, add extra packages
pnpm add @sveltejs/adapter-node @poppanator/sveltekit-svg --save-dev

# run in dev mode
pnpm run dev
```

This template has adjustments in these configuration files:

- `vite.config.js`
- `svelte.config.js`
- `src/static` (all static assets should be placed in `src/static/static-prefix`)


### 3.1 - Install tailwind in the sveltekit app

Reference: https://tailwindcss.com/docs/guides/sveltekit

```shell
# main packages for tailwind
pnpm add tailwindcss postcss autoprefixer --save-dev

# other useful plugins that we use (tailwindUI, and others)
pnpm add @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio tailwind-scrollbar tailwindcss-debug-screens daisyui --save-dev

# initialize the the tailwind.config.js and postcss.config.js configuration files (`pnpm dlx` is equivalent to `npx`)
pnpm dlx tailwindcss init -p
```

This template has adjustments (or creates) these configuration files:

- `tailwind.config.js`
- `src/app.css`
- `src/routes/+layout.svelte`

In `src/app.html` we might have to do some small adjustments:

- add the Inter font: https://github.com/rsms/inter (details here: https://tailwindui.com/documentation#getting-set-up)
- add `height:100%` to the `html` and `body` elements (via `h-full` from tailwind)
- add `bg-gray-50` to the `body` element
- remove/disable the `data-sveltekit-preload-data` attribute


### 3.2 - Make a test build

Reference: https://kit.svelte.dev/docs/adapter-node

We are using the node adapter (instead of the default auto adapter). Make a build and run it:

```shell
pnpm run build

# inspect the build output
ncdu build
```

The port of the application is read from a predefined env variable. By default it is `PORT`, but since the we have set `config.kit.adapter.envPrefix` as `"WEBAPP_"` in `svelte.config.js`, it should now be `WEBAPP_PORT`

```shell
WEBAPP_PORT=3333 node build/index.js
```

Other env variables that might be of interest: 

- `HOST`
- `ORIGIN` 
- `BODY_SIZE_LIMIT`

NOTE: "HTTP doesn't give SvelteKit a reliable way to know the URL that is currently being requested. If `adapter-node` can't correctly determine the URL of your deployment, you may experience this error when using form actions: "Cross-site POST form submissions are forbidden" 
https://kit.svelte.dev/docs/adapter-node#environment-variables-origin-protocolheader-hostheader-and-port-header







## 4 - Initialize the api project

Reference: https://github.com/fastify/fastify-cli?tab=readme-ov-file#generate

```shell

mkdir -p packages/api
cd packages/api

# fastify-cli can be used without an explicit install using `pnpm dlx` or `npx`

pnpm dlx fastify-cli generate --help
pnpm dlx fastify-cli generate . --esm
pnpm install

# run in dev mode (has watch mode and pino-pretty logging)
pnpm run dev

# run in production mode (doesnt not have watch mode and pino-pretty logging)
pnpm run start

# use the explicit path to the fastify cli; this will start the main plugin (which will load all the other plugins via `@fastify/autoload`)
node_modules/.bin/fastify start --watch --port 4000 --options app.js

# we can also start just one specific plugin:
node_modules/.bin/fastify start --watch --port 4000 --options plugins/my-plugin.js

# we can give option for the plugin (received in the second parameter of the plugin function)
node_modules/.bin/fastify start --watch --port 4000 --options plugins/my-plugin.js -- --plugin-option=abc



```



Create a plugin with `fastify-cli`:

NOTE: the output will be too opinionated.

```shell
pnpm dlx fastify-cli generate-plugin --help
pnpm dlx fastify-cli generate-plugin the-plugin

```








## 5 - Systemd units

Reference: ...

### Base configuration for a `app-name:api` service

Create the configuration file:

```shell
mkdir -p config/systemd-units/app-name:api
emacs config/systemd-units/app-name:api/app-name:api.service
```

Copy-paste:

```shell

[Unit]

# https://www.freedesktop.org/software/systemd/man/systemd.unit.html

# for clarity, Description should be the same as the symlink created in /etc/systemd/system
Description="app-name:api"
After=network.target
After=postgresql.service
Wants=postgresql.service


[Service]

# https://www.freedesktop.org/software/systemd/man/systemd.service.html
# https://www.freedesktop.org/software/systemd/man/systemd.exec.html
# https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html

Type=simple

# these 3 options below will be configured separately
User=...
WorkingDirectory=/path/to/project-root
ExecStart=/nix/var/nix/profiles/default/bin/nix-shell --command node packages/api/server.js


#ExecStop=...
Restart=on-failure
RestartSec=3s

# if restarted is used, will try 3 times during a period of 30 seconds; if the process is not running after that
# period, it enters the 'failed' state; for systemd v230 the following 2 options have been renamed and moved to 
# the [Unit] section: StartLimitInterval and StartLimitBurst; more details here:
# - https://serverfault.com/questions/736624/systemd-apiutomatic-restart-after-startlimitinterval
# - https://lists.freedesktop.org/archives/systemd-devel/2017-July/039255.html

#StartLimitInterval=30s
#StartLimitBurst=3
#PrivateTmp=true
#ProtectSystem=full

#StandardOutput=journal
CPUAccounting=true
MemoryAccounting=true
TasksAccounting=true
IOAccounting=true
IPAccounting=true
MemoryMax=1000M

#Environment=ONE=123
#Environment="TWO='with space'"
#EnvironmentFile="/path/to/.env"


[Install]

WantedBy=multi-user.target
```

Reload and activate the `app-name:api` service:

```shell

# make sure that $PWD is the root directory for the project

echo $PWD

sudo ln -s \
"${PWD}/config/systemd-units/app-name:api/app-name:api.service" \
"/etc/systemd/system/app-name:api.service"

sudo systemctl daemon-reload
sudo systemctl enable "app-name:api.service"
sudo systemctl start "app-name:api.service"
```

Systemd will create a new link in `/etc/systemd/system/app-name:api.service` pointing to out `.service` file.

Other commands to interact with the `app-name:api` service:

```shell
sudo systemctl status "app-name:api.service"
journalctl --unit "app-name:api.service" --lines 500
sudo systemctl restart "app-name:api.service"
sudo systemctl start "app-name:api.service"
sudo systemctl stop "app-name:api.service"
sudo systemctl disable "app-name:api.service"
```


### Wrapper scripts for the `app-name:api` service

Create a wrapper for `status` subcommand using a simple shell script:

```shell
touch config/systemd-units/app-name:api/status.sh
chmod 755 config/systemd-units/app-name:api/status.sh
emacs config/systemd-units/app-name:api/status.sh
```

Copy-paste:

```
#!/bin/sh

sudo systemctl status "app-name:api"
```

We can now see the status of the `app-name:api` service using the shell script in the project:

```shell
sudo config/systemd-units/app-name:api/status.sh
```

If this makes sense we can repeat for other systemd subcommands: `restart` and `stop`.


### Wrapper scripts for all services

Similar to the above, but considering all services related to this project:

```shell
touch config/systemd-units/status-all.sh
chmod 755 config/systemd-units/status-all.sh
emacs config/systemd-units/status-all.sh
```

Copy-paste:

```
#!/bin/sh

sudo systemctl status "app-name:api"
sudo systemctl status "app-name:service-b"
sudo systemctl status "app-name:service-c"
```

We can now see the status of all services:

```shell
sudo config/systemd-units/status-all.sh
```


### Specific configuration for `app-name:api` (if necessary)

Add the missing options in the `[Service]` section using the `systemctl edit` command. More details here: https://www.linode.com/docs/guides/introduction-to-systemctl/#editing-a-unit-file

```shell
export SYSTEMD_EDITOR=emacs
sudo systemctl edit "app-name:api"
```

Add add something like this:

```shell

[Service]

User=...
WorkingDirectory=/path/to/project-root
ExecStart=/nix/var/nix/profiles/default/bin/nix-shell --command node packages/api/server.js

```

Any changes to the configuration files requires a reload and restart of the service:

```shell
sudo systemctl daemon-reload
sudo systemctl restart "app-name:api.service"
sudo systemctl status "app-name:api.service"
```

We should now have a new directory in `/etc/systemd/system/app-name:api.service.d`.




--------------------------------------------------------------------------



# TO BE REVIEW: from here

# setup the api server (hapi)

```shell
pnpm create @hapipal api  # equivalent to: npm init @hapipal api
pnpm --filter="./api" install
```

install other dependencies
```shell
pnpm --filter="./api" add nodemon
pnpm --filter="./api" --workspace add postgres-connection 
```

in the scripts section of `api/package.json`, add a new `dev` script:
```shell
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
or start directly from the workspace root directory:
```
pnpm --filter="./api" run dev
```



# other notes (to be reviewed)

