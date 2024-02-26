{
  description = "Drinking game";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell = pkgs.mkShell {
        nativeBuildInputs = with pkgs.nodePackages; [
          pnpm
          svelte-language-server
        ];
        buildInputs = with pkgs; [
          openssl
          nodejs_18
        ];
      };
    });
}
