const path = require("path");

module.exports = {
  getDir(key, relative = false) {
    let root = this.config.get("rootDir");
    if (!key || key == "root") return root;

    let dirs = this.config.get("dir");
    if (!dirs.hasOwnProperty(key))
      throw new Error(`${key} dir isn't part of the configuration`);

    let absPath = path.resolve(root, dirs[key]);

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
    let splitted = src.split(path.sep);
    if (this.isAlias(splitted[0])) {
      splitted[0] = this.resolveAlias(splitted[0]);
      return path.join(...splitted);
    }
    return src;
  },
  ...require("./event-emitter")
};
