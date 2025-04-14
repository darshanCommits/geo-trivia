{
  description = "pnpm monorepo with vite + node dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
  };

  outputs = {nixpkgs, ...}: let
    eachSystem = f:
      nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (system: f nixpkgs.legacyPackages.${system});
  in {
    devShells = eachSystem (pkgs: {
      default = let
        node = pkgs.nodejs_20;
        pnpm = pkgs.pnpm;
      in
        pkgs.mkShell {
          name = "pnpm-monorepo-shell";

          buildInputs = [
            node
            pnpm
          ];

          shellHook = ''
            export NODE_OPTIONS=--max_old_space_size=4096
            echo "📦 pnpm monorepo shell ready!"
          '';
        };
    });
  };
}
