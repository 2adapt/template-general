## A template for monorepos

A template to quickstart new projects at 2adapt. See more details in template-steps.md

## Assumptions about the server

- Ubuntu 22.04 or similar 
- the DNS is configured correctly for the associated domain ("A record")
- The following should be installed and available in the server:
	- nix: https://github.com/DeterminateSystems/nix-installer
	- pnpm: https://pnpm.io/installation#on-posix-systems
	- Caddy: https://caddyserver.com/docs/install#debian-ubuntu-raspbian
	- PostgreSQL: https://www.postgresql.org/download/linux/ubuntu/

## Initial steps:

- set the env variables: `cp config/env.sh.template config/env.sh`
- enter the nix dev shell: `nix develop`
- install the dependencies at the project root: `pnpm install` (if we are in production, make sure `pnpm-lock.yaml` was not modified - it shouldn't if we have `CI="false"` in `config/env.sh`)
- check that the sveltekit app can be built and started: `cd packages/webapp; pnpm run build; node build/index.js;`
- check that the api server can be started: `cd packages/api; node src/server.js;`
- add the website to the caddy configuration (see details in section 1.3)

