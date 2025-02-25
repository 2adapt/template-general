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

		# Mark variables which are modified or created for export.
		set -a

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
			PATH_TO_CONFIG_ENV="${toString ../env.sh}"
		else
			PATH_TO_CONFIG_ENV="${toString ./config/env.sh}"
		fi

		source $PATH_TO_CONFIG_ENV;

		# restore the env variables available in numtide/devshell (PRJ_ROOT)
		# reference: https://github.com/numtide/devshell?tab=readme-ov-file#clean-environment
		PRJ_ROOT=$(dirname $(dirname "$PATH_TO_CONFIG_ENV"))

		# this variable is currently set in env.sh, we can also do it here (but will be less explicit)
		PROJECT_HOME_DIR="$PRJ_ROOT"
		PROJECT_ROOT_DIR="$PRJ_ROOT"

		# enable the locales that are currently available (outside nix-shell)
		# reference: https://nixos.wiki/wiki/Locales
		# reference: https://unix.stackexchange.com/questions/743239/how-to-set-locale-in-nix-shell-on-ubuntu
		LOCALE_ARCHIVE=/usr/lib/locale/locale-archive

		set +a

		alias npm="echo \"npm is not available in the nix-shell. Use pnpm instead.\""
		alias cat=bat

		# MOTD - show basic informations about the database; psql will use the PG* env variables;
		# to avoid showing this message start the nix-shell with SHOW_MOTD="false";
		# this might be necessary in cases where we some utility is called (via nix-shell),
		# and the output is json (or some other structured format)

		if [[ "$SHOW_MOTD" != "false" ]]; then
			#echo "PATH_TO_CONFIG_ENV: $PATH_TO_CONFIG_ENV"
			#echo "PROJECT_ROOT_DIR: $PROJECT_ROOT_DIR"

			echo "You are now in a nix shell."

			echo ""
			echo "Available env variables: \"cat config/env.sh\""

			echo ""
			echo "Database:"

			psql \
			--command="
				SELECT
					current_database() as db_name,
					current_user as db_user,
					inet_server_port() as db_port,
					current_setting('timezone') as db_timezone,
					left(current_setting('server_version'), 20) as pg_version,
					current_setting('search_path') as search_path,
					current_setting('default_tablespace') as default_tablespace;

					-- other settings to check: work_mem, max_connections, shared_buffers
			"
		fi

	'';
}
