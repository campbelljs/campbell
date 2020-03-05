const fs = require("fs-extra");

module.exports = {
  dev: {
    doc: "Controls global dev mode",
    format: "boolean",
    default: process.env.NODE_ENV !== "production"
  },
  name: {
    doc: "Apps's name",
    format: "string",
    default: "my-awesome-app"
  },
  plugins: {
    doc: "Plugins",
    format: "array",
    default: []
  },
  rootDir: {
    doc: "App's root dir",
    format: {
      validate(val) {
        return fs.pathExistsSync(val);
      }
    },
    default: process.cwd()
  },
  dir: {
    build: {
      doc: "Build dir (relative to root)",
      format: "string",
      default: ".campbell"
    },
    public: {
      doc: "Public dir where you store pages and others (relative to root)",
      format: "string",
      default: "public"
    },
    plugins: {
      doc:
        "Plugins located in this dir are automatically loaded (relative to root)",
      format: "string",
      default: "plugins"
    }
  },
  alias: {
    doc: "Define alias",
    format: "object",
    default: {}
  },
  client: require("./client"),
  server: require("./server")
};
