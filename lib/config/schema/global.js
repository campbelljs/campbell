const fs = require("fs-extra");

module.exports = {
  env: {
    doc: "The application environment.",
    format: "string",
    // ["production", "development", "test"]
    default: process.env.NODE_ENV || "development",
    env: "NODE_ENV"
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
    // named directories (provide an absolute path or a path relative to rootDir)
    build: {
      doc: "Build dir",
      format: "string",
      default: "./.campbell"
    },
    public: {
      doc: "Public dir where you store pages, routers and others",
      format: "string",
      default: "./public"
    },
    static: {
      doc: "Static dir where you store assets, medias and others",
      format: "string",
      default: "./static"
    },
    plugins: {
      doc: "Plugins located in this dir are automatically loaded",
      format: "string",
      default: "./plugins"
    }
  },
  alias: {
    doc: "Define alias",
    format: "object",
    default: {}
  },
  ui: require("./ui"),
  server: require("./server")
};
