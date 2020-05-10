const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const decache = require("decache");

const { Router } = require("express");

module.exports = {
  test(src) {
    return /\.router(\.js)?$/.test(src);
  },
  load({ src, route }) {
    const instance = this;
    const logger = this.logger;

    function createRouter(src) {
      let setRouter = require(src);
      if (typeof setRouter !== "function")
        throw new Error(`${src} must be a function`);
      let router = Router();
      setRouter.call(instance, router);
      return router;
    }

    let router = createRouter(src);

    let id = `router-loader:${src}`;
    let version = 0;

    function set() {
      let before = (req, res, next) => {
        // inject params
        req.$params = req.params;
        next();
      };
      instance.server.middlewares.use(route, before).as(`${id}:before`);
      instance.server.middlewares.use(route, router).as(`${id}:${version}`);
      logger.verbose(`mounted a router at route ${route}`);
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
    if (instance.isDev) fs.watch(src, { recursive: true }, update);
  }
};
