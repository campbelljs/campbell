const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const decache = require("decache");

const { Router } = require("express");

module.exports = function(src, baseDir) {
  const instance = this;
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

  let route = src.replace(baseDir, "").split(path.sep);
  let name = path.parse(src).name.replace(/.router$/, "");
  // remove last item
  route.pop();
  // add name at tail
  if (name !== "index") route.push(name);
  // get final route string
  route = route.join("/");

  let router = createRouter(src);

  let id = `auto:${src}`;
  let version = 0;

  function set() {
    instance.server.middlewares.use(route, router).as(`${id}:${version}`);
    logger.verbose(`mounted router : ${id} at route ${route}`);
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
};
