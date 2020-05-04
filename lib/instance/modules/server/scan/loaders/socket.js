const path = require("path");
const fs = require("fs-extra");
const decache = require("decache");

module.exports = {
  test(src) {
    return /\.socket(\.js)?$/.test(src);
  },
  load({ src, route }) {
    const instance = this;
    const io = this.server.io;
    const logger = this.logger;

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

    let id = `socket-loader:${src}`;
    let version = 0;
    function set() {
      setNsp();
      logger.verbose(`mounted socket at route ${route}`);
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
  }
};
