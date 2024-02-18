{ yarn2nix, mkYarnPackage, ... }:

{
  build = mkYarnPackage {
    name = "florianschroedl.com";
    src = ./.;
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
  };
}
