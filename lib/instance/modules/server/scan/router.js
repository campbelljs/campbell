const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const decache = require("decache");

const { Router } = require("express");

module.exports = function() {
  let instance = this;
  const logger = this.logger;

  function createRouter(src) {
    let setRouter = require(src);
    if (typeof setRouter !== "function")
      throw new Error(`${src} must be a function`);
    let router = Router();
    // TODO : inject params with a router.use here
    setRouter.call(instance, router);
    return router;
  }

  // let publicDir = this.getDir("public");
  function loadDir(dir) {
    if (!path.isAbsolute(dir)) throw new Error("dir's path must be absolute");
    glob.sync(`${dir}/**/router.js`).forEach(function(src) {
      let router = createRouter(src);
      let route = src
        .replace("/router.js", "")
        .replace(dir, "/")
        .replace("//", "/");

      let id = `auto:${src}`;
      let version = 0;

      function set() {
        instance.server.middlewares.use(route, router).as(`${id}:${version}`);
        logger.verbose(`mounted router : ${id}`);
      }

      function update() {
        let prevLabel = `${id}:${version}`;
        version += 1;
        let newLabel = `${id}:${version}`;

        decache(src);
        let newRouter = createRouter(src);

        instance.server.middlewares
          .before(prevLabel)
          .use(route, newRouter)
          .as(newLabel);
        instance.server.middlewares.remove(prevLabel);
        logger.verbose(`updated router : ${id} (v${version})`);
      }

      set();
      if (instance.isDev) fs.watchFile(src, update);
    }, this);
  }

  loadDir(this.getDir("public"));
  this.plugins.forEach(({ path: pluginPath }) => {
    if (fs.pathExistsSync(pluginPath)) {
      loadDir(path.resolve(pluginPath, "public"));
    }
  });
};
