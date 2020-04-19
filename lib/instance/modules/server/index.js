let http = require("http");

class Server {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    instance.registerHooks(require("./hooks"));

    this.app = require("express")();
    this.middlewares = require("connectr")(this.app);
    this.http = http.createServer(this.app);
    this.io = require("socket.io")(this.http);

    instance.hooks["init"].tap("Server", this.init.bind(this));
    instance.hooks["start"].tap("Server", this.start.bind(this));
  }
  init() {
    // plugins already installed

    require("./security").call(this.#instance);
    // scan the public dir for routers, socketio namespaces etc ...
    require("./scan").call(this.#instance);
    // AFTER API
    if (!this.#instance.noUi)
      this.middlewares.use(this.#instance.ui.render).as("render");
  }
  start() {
    let port = this.config.get("server.port");
    let url = this.url;
    let logger = this.#instance.logger;

    let listen = function() {
      this.http.listen(port, () => {
        logger.info(`server available at ${url}`);
      });
    }.bind(this);

    if (this.#instance.noUi) {
      listen();
    } else {
      this.#instance.hooks["ui:first-build:done"].tap("Server", listen);
    }
  }
  stop() {
    this.server.close();
  }
  use(...args) {
    return this.app.use(...args);
  }
  get config() {
    return this.#instance.config;
  }
  get url() {
    let { ssl, host, port } = this.config.get("server");
    return `${ssl.enabled ? "https" : "http"}://${host}:${port}`;
  }
  static create(instance) {
    return new Server(instance);
  }
}

module.exports = Server;
