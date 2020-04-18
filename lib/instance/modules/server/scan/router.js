const glob = require("glob");
const { Router } = require("express");

module.exports = function() {
  let $instance = this;
  let publicDir = this.getDir("public");
  glob.sync(`${publicDir}/**/router.js`).forEach(function(src) {
    let setRouter = require(src);
    if (typeof setRouter !== "function")
      throw new Error(`${src} must be a function`);
    let router = Router();
    // TODO : inject params with a router.use here
    setRouter.call($instance, router);

    let route = src
      .replace("/router.js", "")
      .replace(publicDir, "/")
      .replace("//", "/");

    this.logger.verbose(`auto-registering router at path ${route}`);
    this.server.use(route, router);
  }, this);
};
