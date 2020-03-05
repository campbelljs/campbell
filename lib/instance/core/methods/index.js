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
  }
};
