const path = require("path");
const fs = require("fs-extra");
const decache = require("decache");

module.exports = function(src, baseDir) {
  const instance = this;
  const io = this.server.io;
  const logger = this.logger;

  // get route
  let route = src.replace(baseDir, "").split(path.sep);
  let name = path.parse(src).name.replace(/.socket$/, "");
  route.pop();
  if (name !== "index") route.push(name);
  route = route.join("/");

  function setNsp() {
    let useNamespace = require(src);
    if (typeof useNamespace !== "function")
      throw new Error(`${src} must be a function`);

    let nsp = io.of(route);
    useNamespace.call(instance, nsp);
  }
  function deleteNsp(nspRoute) {
    let nsp = io.of(nspRoute);
    Object.keys(nsp.connected).forEach(socketId => {
      nsp.connected[socketId].disconnect(); // Disconnect Each socket
    });
    nsp.removeAllListeners(); // Remove all Listeners for the event emitter
    delete io.nsps[nspRoute]; // Remove from the server namespaces
  }

  let id = `auto:${src}`;
  let version = 0;
  function set() {
    setNsp();
    logger.verbose(`mounted socket : ${id} at route ${route}`);
  }
  function update() {
    version += 1;
    decache(src);
    deleteNsp(route);
    setNsp();

    logger.verbose(`updated socket : ${id} (v${version})`);
  }

  set();
  if (instance.isDev) fs.watchFile(src, update);
};
