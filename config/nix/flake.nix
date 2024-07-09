{
	description = "devshell for template-for-monorepo";

	inputs.devshell.url = "github:numtide/devshell";
	inputs.flake-utils.url = "github:numtide/flake-utils";
	inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
	#inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

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

					motd = "welcome to the template-for-monorepo devshell";
					name = "template-for-monorepo";  # will have impact in the DEVSHELL_DIR env variable; see below
					#imports = [ (pkgs.devshell.importTOML ../env.toml) ];

					devshell.packages = [
						pkgs.nodejs_22
						pkgs.corepack_22
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

							echo "at startup"

							set -a
							source $PRJ_ROOT/config/env.sh
							set +a

							# show basic informations about the database
							psql -c "select current_database(), current_user, split_part(version(), ' ', 2) as version, inet_server_addr() as server_addr, inet_server_port() as server_port"

							alias npm="echo npm is not available in this shell. Use pnpm instead."
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
