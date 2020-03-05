const fs = require("fs-extra");

module.exports = {
  dev: {
    doc: "Controls global dev mode",
    format: Boolean,
    default: process.env.NODE_ENV !== "production"
  },
  name: {
    doc: "Apps's name",
    format: String,
    default: "my-awesome-app"
  },
  plugins: {
    doc: "Plugins",
    format: Array,
    default: []
  },
  rootDir: {
    doc: "App's root dir",
    format: function(val) {
      return fs.pathExistsSync(val);
    },
    default: process.cwd()
  },
  dir: {
    build: {
      doc: "Build dir (relative to root)",
      format: String,
      default: ".campbell"
    },
    public: {
      doc: "Public dir where you store pages and others (relative to root)",
      format: String,
      default: "public"
    },
    plugins: {
      doc:
        "Plugins located in this dir are automatically loaded (relative to root)",
      format: String,
      default: "plugins"
    }
  },
  alias: {
    doc: "Define alias",
    format: Object,
    default: {}
  },
  client: require("./client"),
  server: require("./server")
};
