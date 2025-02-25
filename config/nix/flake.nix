{
	description = "devshell for template-for-monorepo";

	inputs.devshell.url = "github:numtide/devshell";
	inputs.flake-utils.url = "github:numtide/flake-utils";

	inputs.nixpkgs.url = "https://github.com/NixOS/nixpkgs/archive/refs/heads/nixos-24.11.tar.gz";
	#inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";

	#inputs.nixpkgs.url = "https://github.com/NixOS/nixpkgs/archive/refs/heads/nixos-unstable.tar.gz";
	#inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

	outputs = { self, nixpkgs, devshell, flake-utils, ... }:
		flake-utils.lib.eachDefaultSystem (system: {
			devShells.default =
				let
					pkgs = import nixpkgs {
						inherit system;
						overlays = [ devshell.overlays.default ];
					};
				in

				# example: https://github.com/chvp/nixos-config/blob/main/shells/dodona.nix
				pkgs.devshell.mkShell {

					#motd = "welcome to the template-for-monorepo devshell";
					#name = "template-for-monorepo";  # will have impact in the DEVSHELL_DIR env variable; see below
					#imports = [ (pkgs.devshell.importTOML ../env.toml) ];

					devshell.packages = [
						pkgs.nodejs_22
						pkgs.corepack_22 # pnpm, etc
						pkgs.bat
						pkgs.curl
						# add other packages here
					];


					commands = [
						{
							name = "a_test_command";
							help = "usage: a_test_command";
							command = ''

							echo "numtide/devshell provides these 4 new env variables: 
								PRJ_ROOT=$PRJ_ROOT
								DEVSHELL_DIR=$DEVSHELL_DIR
								PRJ_DATA_DIR=$PRJ_DATA_DIR 
								NIXPKGS_PATH=$NIXPKGS_PATH
							"

							'';
						}
						{
							name = "ls_wrapper";
							help = "usage: ls_wrapper <arg1> <arg2> (used to to test arguments)";
							command = ''
								ls $1 $2
							'';
						}
					];

					# devshell.startup will run on both interactive and non-interactive shells

					devshell.startup = {
						s1 = {
							text = ''

								echo "at devshell.startup"
								# exit

								PROJECT_ROOT_DIR="$PRJ_ROOT"
								PROJECT_HOME_DIR="$PRJ_ROOT"

								# enable the locales that are currently available (outside nix-shell)
								# reference: https://nixos.wiki/wiki/Locales
								# reference: https://unix.stackexchange.com/questions/743239/how-to-set-locale-in-nix-shell-on-ubuntu
								LOCALE_ARCHIVE=/usr/lib/locale/locale-archive

								# automatically exports all subsequently defined variables to the environment
								set -o allexport
								source $PRJ_ROOT/config/env.sh
								set +o allexport

								alias npm="echo \"npm is not available in this nix-shell. Use pnpm instead.\""
								alias cat_original=$(which cat)
								alias cat=bat

							'';
						};
					};

					# devshell.interactive will run on interactive shells only
					
					# devshell.interactive = {
					# 	i1 = {
					# 		text = ''
					#
					# 		echo "at interactive"
					# 		set -a
					# 		source $PRJ_ROOT/config/env.sh
					# 		set +a
					#
					# 		alias npm="echo npm is not available in this shell. Use pnpm instead."
					# 		alias cat=bat
					#
					# 		'';
					# 	};
					# };

				};
		});
}
