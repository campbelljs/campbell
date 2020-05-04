require("dotenv").config();
const path = require("path");

const { addPath } = require("./helpers/module-alias");
// FIXME: temporary fixup for module resolution when using npm link in dev mode
let {
  CAMPBELL_FIX_MODULE_RESOLUTION,
  CAMPBELL_MODULE_DIRECTORIES
} = process.env;
if (CAMPBELL_FIX_MODULE_RESOLUTION) {
  addPath(path.resolve(process.cwd(), "node_modules"));
}
if (CAMPBELL_MODULE_DIRECTORIES) {
  CAMPBELL_MODULE_DIRECTORIES.split(":")
    .filter(src => src !== "")
    .forEach(addPath);
}

module.exports = require("./instance");
