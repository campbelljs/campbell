const path = require("path");

module.exports = {
  getDir(key, relative = false) {
    let root = this.config.get("rootDir");
    if (!key || key == "root") return root;

    let dirs = this.config.get("dir");
    if (!dirs.hasOwnProperty(key))
      throw new Error(`${key} dir isn't part of the configuration`);

    let dirPath = dirs[key];
    let absPath = path.isAbsolute(dirPath)
      ? dirPath
      : path.resolve(root, dirPath);

    // return path relative to root or absolute
    if (relative) {
      return path.relative(root, absPath);
    } else {
      return absPath;
    }
  },
  isAlias(str) {
    return Object.keys(this.alias).includes(str);
  },
  resolveAlias(alias) {
    if (!this.isAlias(alias)) throw new Error(`unknown alias ${alias}`);
    return this.alias[alias];
  },
  resolvePath(src) {
    // try to resolve with alias
    let splitted = src.split(path.sep);
    if (this.isAlias(splitted[0])) {
      splitted[0] = this.resolveAlias(splitted[0]);
      // alias refers to absolute paths
      return path.join(...splitted);
    }

    // try to resove with "require"
    try {
      return require.resolve(src);
    } catch (e) {
      // do nothing and continue
    }
    if (!path.isAbsolute(src)) throw new Error(`Can't resolve path : ${src}`);

    // finally return raw path if already an abs path
    return src;
  }
};
