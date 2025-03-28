# to measure the startup time for a nix-shell, uncomment exit in the first line to shellHook

# quick bennchmarks in the thinkbook dev machine:
# - with no packages: 3.3 seconds

let
	# channel status: https://status.nixos.org
	stable-channel = "https://github.com/NixOS/nixpkgs/archive/refs/heads/nixos-24.11.tar.gz";
	#unstable-channel = "https://github.com/NixOS/nixpkgs/archive/refs/heads/nixos-unstable.tar.gz";

	nixpkgs = fetchTarball stable-channel;
	pkgs = import nixpkgs { config = {}; overlays = []; };
in
pkgs.mkShell {

	packages = [
		pkgs.nodejs_22
		pkgs.corepack_22 # provides pnpm, etc
		pkgs.bat
		pkgs.curl
		pkgs.zstd
		pkgs.brotli
		pkgs.gzip
		pkgs.pgformatter
		pkgs.shfmt
		# add other packages here
		#(pkgs.python3.withPackages(p: [p.numpy p.gdal]))
	];

	shellHook = ''

		# echo "Exiting"
		# exit

		# find the correct path to config/env.sh; we have to handle the discrepancy that happens
		# for the different ways nix-shell can be started:
		#
		# 1) "nix-shell path/to/dir/shell.nix"
		# 2) "nix-shell path/to/dir"
		# 3) "nix-shell" (equivalent to "nix-shell ."
		#
		# since v2.24 the behaviour of ${toString ./foo} seems to have changed;
		# reference: https://releases.nixos.org/nix/nix-2.24.0/manual/release-notes/rl-2.24.html

		if [[ "${toString ./.}" == *"/config/nix" ]]; then
			CONFIG_ENV="${toString ../env.sh}"
		else
			CONFIG_ENV="${toString ./config/env.sh}"
		fi

		# automatically exports all subsequently defined variables to the environment
		set -o allexport

		# restore the env variables available in numtide/devshell (PRJ_ROOT)
		# reference: https://github.com/numtide/devshell?tab=readme-ov-file#clean-environment
		PRJ_ROOT=$(dirname $(dirname "$CONFIG_ENV"))

		source $CONFIG_ENV;

		set +o allexport

		alias npm="echo \"npm is not available in this nix-shell. Use pnpm instead.\""
		alias cat_original=$(which cat)
		alias cat=bat

		# MOTD - show basic informations about the database; psql will use the PG* env variables;
		# to avoid showing this message start the nix-shell with SHOW_MOTD="false";
		# this might be necessary in cases where we some utility is called (via nix-shell),
		# and the output is json (or some other structured format)

		if [[ "$SHOW_MOTD" != "false" ]]; then
			echo "You are now in a nix shell."

			#echo "CONFIG_ENV=$CONFIG_ENV"
			#echo "PROJECT_ROOT_DIR=$PROJECT_ROOT_DIR"

			echo ""
			echo "Available env variables: \"cat config/env.sh\""

			echo ""
			echo "Database:"

			psql --pset pager=off --command="

				SELECT
					current_database() as db_name,
					current_user as db_user,
					inet_server_port() as db_port,
					current_setting('timezone') as db_timezone,
					left(current_setting('server_version'), 20) as pg_version,
					current_setting('search_path') as search_path,
					current_setting('default_tablespace') as default_tablespace

					-- other settings to check: work_mem, max_connections, shared_buffers
			"
		fi

	'';
}
