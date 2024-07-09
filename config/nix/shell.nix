let
	# commit hash can be obtained from https://status.nixos.org or https://channels.nixos.org
	nixos-2405 = "https://github.com/NixOS/nixpkgs/archive/7dca15289a1c2990efbe4680f0923ce14139b042.tar.gz";
	#nixos-2311 = "https://github.com/NixOS/nixpkgs/archive/4a1e673523344f6ccc84b37f4413ad74ea19a119.tar.gz";
	#nixos-2305 = "https://github.com/NixOS/nixpkgs/archive/70bdadeb94ffc8806c0570eb5c2695ad29f0e421.tar.gz";
	#nixos-2211 = "https://github.com/NixOS/nixpkgs/archive/ea4c80b39be4c09702b0cb3b42eab59e2ba4f24b.tar.gz";
	#nixos-2205 = "https://github.com/NixOS/nixpkgs/archive/380be19fbd2d9079f677978361792cb25e8a3635.tar.gz";
	nixpkgs = fetchTarball nixos-2405; 
	pkgs = import nixpkgs { config = {}; overlays = []; };
in
pkgs.mkShell {
	packages = [ 
		pkgs.nodejs_22
		pkgs.corepack_22
		pkgs.bat
		pkgs.curl
		# add other packages here
	];
	shellHook = ''
		# Mark variables which are modified or created for export.
		set -a
		source ${toString ../env.sh}

		# mimic the env variables available in numtide/devshell
		PRJ_ROOT="$PWD"
		
		set +a

		# show basic informations about the database
		psql -c "select current_database(), current_user, split_part(version(), ' ', 2) as version, inet_server_addr() as server_addr, inet_server_port() as server_port"

		alias npm="echo npm is not available in this shell. Use pnpm instead."
		alias cat=bat
	'';
}
