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
      default: ".dist"
    },
    public: {
      doc: "Public dir where you store pages and others (relative to root)",
      format: String,
      default: "public"
    }
  },
  client: require("./client"),
  server: require("./server")
};
