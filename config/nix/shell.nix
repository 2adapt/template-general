# to measure the startup time for a nix-shell, use exit in the first line to shellHook
# in the thinkbook dev machine:
# - with 0 packages: 3 seconds
# - with 1 "(pkgs.python3.withPackages(p: [p.numpy p.gdal]))": 5 seconds
# - the other packages added 1 more second

let
    nixpkgs-unstable = "https://github.com/NixOS/nixpkgs/archive/nixpkgs-unstable.tar.gz";
    nixpkgs-2405 = "https://github.com/NixOS/nixpkgs/archive/24.05.tar.gz";

	# see also: https://status.nixos.org or https://channels.nixos.org
	#nixos-XXXX = "https://github.com/NixOS/nixpkgs/archive/<commit_hash>.tar.gz";

	nixpkgs = fetchTarball nixpkgs-2405;
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
	];

	shellHook = ''

		#exit
		# Mark variables which are modified or created for export.
		set -a

		# handle the discrepancy that happens when nix-shell is started via "nix-shell" vs
		# "nix-shell path/to/dir/shell.nix" or "nix-shell path/to/dir"
		# since v2.24 the behaviour of ${toString ./file.txt} seems to be a little different;
		# details here: https://releases.nixos.org/nix/nix-2.24.0/manual/release-notes/rl-2.24.html

		# assume case 1: nix-shell started with "nix-shell path/to/dir/shell.nix" or "nix-shell path/to/dir/"

		PATH_TO_ENV_FILE="${toString ../env.sh}"

		if [[ "$PATH_TO_ENV_FILE" == *"/config/env.sh" ]]; then
			echo "PATH_TO_ENV_FILE: $PATH_TO_ENV_FILE"
		else
			# case 2: nix-shell started with just "nix-shell" (without a "path/to/dir/shell.nix"); it will
			# try to load a "shell.nix" file in the current directory; but if that file is actually a symlink
			# to "./config/nix/shell.nix", then toString will give us the working directory

			PATH_TO_ENV_FILE="${toString ./config/env.sh}"
			echo "PATH_TO_ENV_FILE (updated): $PATH_TO_ENV_FILE"
			source $PATH_TO_ENV_FILE;
		fi

		source $PATH_TO_ENV_FILE;

		# mimic the env variables available in numtide/devshell (PRJ_ROOT)
		PRJ_ROOT=$(dirname "$PATH_TO_ENV_FILE")
		PRJ_ROOT=$(dirname "$PRJ_ROOT")

		# this variable is currently set in env.sh, we can also do it here (but will be less explicit)
		PROJECT_HOME_DIR2="$PRJ_ROOT"

		echo "PRJ_ROOT: $PRJ_ROOT"
		echo "PROJECT_HOME_DIR2: $PROJECT_HOME_DIR2"

		# enable the locales that are currently available (outside nix-shell)
		# reference: https://nixos.wiki/wiki/Locales
		# reference: https://unix.stackexchange.com/questions/743239/how-to-set-locale-in-nix-shell-on-ubuntu
		LOCALE_ARCHIVE=/usr/lib/locale/locale-archive

		set +a

		alias npm="echo \"npm is not available in this shell. Use pnpm instead.\""
		alias cat=bat

		# MOTD - show basic informations about the database; psql will use the PG* env variables;
		# to avoid showing the MOTD, we have to explicitely set this variable to "false";
		# this might be necessary in cases where we some utility is called (via nix-shell),
		# and the output is json (or some other structured format)

		if [[ "$SHOW_MOTD" != "false" ]]; then
			psql --command="select current_database(), current_user, split_part(version(), ' ', 2) as version, inet_server_addr() as server_addr, inet_server_port() as server_port"
		fi

	'';
}
