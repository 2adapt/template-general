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

# the env variables in this file will be available in the nix shell (below)
touch config/env.sh.template
```

It's convenient to have a shortcut for `config/nix/flake.nix` in the project root:

```shell
# note that we actually want the symlink to have a relative path
ln -s ./config/nix/flake.nix flake.nix

# to enter the devshell it's necessary that flake.nix is already part of the repo
git add ./config/nix/flake.nix 
git add flake.nix

# we can now enter the devshell
nix develop
```

## 1.3 - caddy files

```shell
mkdir -p config/caddy

touch config/caddy/Caddyfile-dev
touch config/caddy/Caddyfile-prod
```

The main caddy configuration should import one of the files above:

```shell
sudo emacs /etc/caddy/Caddyfile
```

```

# add a new site block

http://the-domain.local {
	import /path/to/project/config/caddy/Caddyfile-dev
	#import /path/to/project/config/caddy/Caddyfile-prod
}

```

Caddy must be reloaded after the main caddyfile (or one of the included Caddyfiles) are changed:

```shell
sudo systemctl reload caddy
```

For local development we can update the `/etc/hosts` to have a local domain:

```shell
sudo emacs /etc/hosts
```

Append these lines:

```
...
127.0.0.1 the-domain.local
```

NOTE: sveltekit hot reload doesn't seem to work well with these local domains

## 2 - Add a dummy package to see the monorepo working

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

It's important to always use `pnpm add ...` from the monorepo packages, to make sure that pnpm will not created a `package.json` in the project root

To install a package from the local workspace:

```shel
mkdir -p packages/dummy-2
cd packages/dummy-2
pnpm init
pnpm add dummy --workspace
cat ../../pnpm-lock.yaml | grep --context=9 dummy-2
```


## 3 - Initialize the sveltekit project

Reference: https://kit.svelte.dev/docs/creating-a-project

```shell
cd packages
pnpm create svelte@latest webapp
cd webapp
pnpm install

# add extra packages
pnpm add @sveltejs/adapter-node @poppanator/sveltekit-svg --save-dev

# run in dev mode
pnpm run dev
```

This template has adjustments in these configuration files:

- `vite.config.js`
- `svelte.config.js`
- `src/static` (all static assets should be placed in `src/static/static-v1`)

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

Some small adjustments that might be necessary in `src/app.html`:

- add the Inter font: https://github.com/rsms/inter (details here: https://tailwindui.com/documentation#getting-set-up)
- add `height:100%` to the `html` and `body` elements (via `h-full` from tailwind)
- add `bg-gray-50` to the `body` element
- remove the `data-sveltekit-preload-data` attribute

### 3.2 - Make a test build

We are using the node adapter. Make a build and run it:

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




















# TO BE REVIEW: from here

# setup the api server

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




## other directories and files

```shell
mkdir upload
touch upload/initial_dummy_file
```

# other notes (to be reviewed)





## TO BE DONE Advanced configuration: systemd units

### Base configuration for `app-name:service-a`

Create the configuration file:

```shell
mkdir -p config/systemd-units/app-name:service-a
emacs config/systemd-units/app-name:service-a/app-name:service-a.service
```

Copy-paste to `config/systemd-units/app-name:service-a/app-name:service-a.service`:

```shell
[Unit]

# https://www.freedesktop.org/software/systemd/man/systemd.unit.html

# for clarity, Description should the same as the symlink created in /etc/systemd/system
Description="app-name:service-a"
After=network.target
After=postgresql.service
Wants=postgresql.service


[Service]

# https://www.freedesktop.org/software/systemd/man/systemd.service.html
# https://www.freedesktop.org/software/systemd/man/systemd.exec.html
# https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html

Type=simple

# these 3 options below will be configured separately
#User=...
#WorkingDirectory=...
#ExecStart=...


#ExecStop=...
Restart=on-failure
RestartSec=3s

# if restarted is used, will try 3 times during a period of 30 seconds; if the process is not running after that
# period, it enters the 'failed' state; for systemd v230 the following 2 options have been renamed and moved to 
# the [Unit] section: StartLimitInterval and StartLimitBurst; more details here:
# - https://serverfault.com/questions/736624/systemd-service-automatic-restart-after-startlimitinterval
# - https://lists.freedesktop.org/archives/systemd-devel/2017-July/039255.html

StartLimitInterval=30s
StartLimitBurst=3
PrivateTmp=true
ProtectSystem=full

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


Activate the `app-name:service-a` service:

```shell

sudo ln -s \
"${PWD}/config/systemd-units/app-name:service-a/app-name:service-a.service" \
"/etc/systemd/system/app-name:service-a.service"

sudo systemctl daemon-reload
sudo systemctl enable "app-name:service-a.service"
```

Other commands to interact with the `app-name:service-a` service:

```shell
sudo systemctl status "app-name:service-a.service"
sudo systemctl restart "app-name:service-a.service"
sudo systemctl start "app-name:service-a.service"
sudo systemctl stop "app-name:service-a.service"
sudo systemctl disable "app-name:service-a.service"
```

### specific configuration for `app-name:service-a`

Add the missing options in the `[Service]` section using the `systemctl edit` command. More details here: https://www.linode.com/docs/guides/introduction-to-systemctl/#editing-a-unit-file

```shell
export SYSTEMD_EDITOR=emacs
sudo systemctl edit "app-name:service-a"
```

Add add something like this:
```shell
[Service]

User=2adapt
WorkingDirectory=/opt/2adapt/app-name
ExecStart=/path/to/nix-shell --run "node packages/package-name/index.js" ./shell.nix

```

Reload the configuration and restart the service:
```shell
sudo systemctl daemon-reload
sudo systemctl restart "app-name:service-a.service"
sudo systemctl status "app-name:service-a.service"

```

We should now have a new directory in `/etc/systemd/system/app-name:service-a.service.d`

### wrapper scripts for `service-a`

```shell
touch config/systemd-units/app-name:service-a/status.sh
touch config/systemd-units/app-name:service-a/restart.sh
touch config/systemd-units/app-name:service-a/stop.sh

chmod 755 config/systemd-units/app-name:service-a/status.sh
chmod 755 config/systemd-units/app-name:service-a/restart.sh
chmod 755 config/systemd-units/app-name:service-a/stop.sh
```

---

```shell
emacs config/systemd-units/app-name:service-a/status.sh
```

```shell
#!/bin/sh

sudo systemctl status "app-name:service-a"
```

---

```shell
emacs config/systemd-units/app-name:service-a/restart.sh
```

```shell
#!/bin/sh

sudo systemctl restart "app-name:service-a"
```

---

```shell
emacs config/systemd-units/app-name:service-a/stop.sh
```

```shell
#!/bin/sh

sudo systemctl stop "app-name:service-a"
```



### wrapper scripts for all services

```shell
touch config/systemd-units/status-all.sh
touch config/systemd-units/restart-all.sh
touch config/systemd-units/stop-all.sh

chmod 755 config/systemd-units/status-all.sh
chmod 755 config/systemd-units/restart-all.sh
chmod 755 config/systemd-units/stop-all.sh
```

---

```shell
emacs config/systemd-units/status-all.sh
```

```shell
#!/bin/sh

sudo systemctl status "app-name:service-a"
#sudo systemctl status "app-name:service-b"
```

---


```shell
emacs config/systemd-units/restart-all.sh
```

```shell
#!/bin/sh

sudo systemctl restart "app-name:service-a"
#sudo systemctl restart "app-name:service-b"
```

---


```shell
emacs config/systemd-units/stop-all.sh
```

```shell
#!/bin/sh

sudo systemctl stop "app-name:service-a"
#sudo systemctl stop "app-name:service-b"
```
