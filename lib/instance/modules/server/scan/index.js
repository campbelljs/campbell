const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");

const express = require("express");

function walk(dir, stop = () => false, filelist) {
  var path = path || require("path");
  var fs = fs || require("fs"),
    files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    let filePath = path.join(dir, file);
    if (stop && stop(filePath)) return;
    else if (fs.statSync(filePath).isDirectory()) {
      filelist = [filePath, ...walk(filePath, stop, filelist)];
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
}

function parseRoute(src, baseDir) {
  let route = src.replace(baseDir, "").split(path.sep);
  route.shift();
  let name = path.parse(src).name.replace(/\..*$/, "");
  // remove last item (name)
  route.pop();
  // add name at tail
  if (name !== "index") route.push(name);
  // route params
  route = route.map(name => name.replace(/^\_(?!\_)/, ":"));
  // get final route string
  route = "/" + route.join("/");
  console.log(route);
  return route;
}

module.exports = function() {
  const instance = this;
  const logger = this.logger;

  const loaders = this.server.loaders;

  function getLoader(src, baseDir, route) {
    for (var loader of loaders) {
      if (loader.test.call(this, src, baseDir, route)) {
        return loader;
      }
    }
    return false;
  }

  function loadPublicDir(dir) {
    if (!path.isAbsolute(dir)) throw new Error("dir's path must be absolute");
    let baseDir = dir;

    let promises = [];

    let seen = walk(dir, function(src) {
      let route = parseRoute(src, baseDir);

      for (var loader of loaders) {
        if (loader.test.call(this, src, baseDir, route)) {
          promises.push(loader.load.call(instance, { src, baseDir, route }));
          // stop walking if loading
          return true;
        }
      }
      return false;
    });

    return Promise.all(promises);
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
