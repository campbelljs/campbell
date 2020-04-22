const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");

const express = require("express");

function walkSync(dir, filelist) {
  var path = path || require("path");
  var fs = fs || require("fs"),
    files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
}

module.exports = function() {
  const instance = this;
  const logger = this.logger;

  function loadPublicDir(dir) {
    if (!path.isAbsolute(dir)) throw new Error("dir's path must be absolute");
    walkSync(dir).forEach(function(src) {
      loadFile(src, dir);
    });
  }
  function loadFile(src, baseDir) {
    require("./load").call(instance, src, baseDir);
  }

  function loadStaticDir(dir) {
    let serveStatic = express.static(dir, {
      extensions: ["html"]
    });
    instance.server.app.use((req, res, next) => {
      // TODO: create a static file ignore property
      let ignored = false;
      if (ignored) next();
      else serveStatic(req, res, next);
    });
  }

  let candidates = [
    this.getDir("root"),
    ...this.plugins.registry.map(({ dir }) => dir)
  ];
  candidates.forEach(dir => {
    logger.verbose(`loading dir : ${dir}`);
    let publicPath = path.resolve(dir, "public");
    if (fs.pathExistsSync(publicPath)) {
      loadPublicDir(publicPath);
    }

    let staticPath = path.resolve(dir, "static");
    if (fs.pathExistsSync(staticPath)) {
      loadStaticDir(staticPath);
    }
  });
};
