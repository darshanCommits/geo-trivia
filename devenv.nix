{ pkgs, lib, config, inputs, ... }:

{
  packages = [ pkgs.pnpm pkgs.nodejs ];

  # https://devenv.sh/languages/
  languages.typescript.enable = true;

  # https://devenv.sh/processes/
  # processes.cargo-watch.exec = "cargo-watch";

  # https://devenv.sh/services/
  services.postgres.enable = true;

  # https://devenv.sh/scripts/

  enterShell = ''
    echo "📦 pnpm monorepo shell ready!"
    
  '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
