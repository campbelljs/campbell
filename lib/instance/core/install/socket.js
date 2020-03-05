const glob = require("glob");

module.exports = function() {
  let $app = this;
  let publicDir = this.getDir("public");
  glob.sync(`${publicDir}/**/socket.js`).forEach(function(src) {
    let useNamespace = require(src);
    if (typeof useNamespace !== "function")
      throw new Error(`${src} must be a function`);

    let route = src
      .replace("/socket.js", "")
      .replace(publicDir, "/")
      .replace("//", "/");
    let nsp = $app.server.io.of(route);

    useNamespace.bind($app)(nsp);
  }, this);
};
