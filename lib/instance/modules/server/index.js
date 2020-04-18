let http = require("http");

class Server {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    instance.registerHooks(require("./hooks"));

    this.app = require("express")();
    this.http = http.createServer(this.app);
    this.io = require("socket.io")(this.http);

    instance.hooks["start"].tap("Server", this.start.bind(this));
  }
  init() {
    require("./security").call(this.#instance);
    // scan the public dir for routers, socketio namespaces etc ...
    require("./scan").call(this.#instance);
    // AFTER API
    if (!this.#instance.noClient) this.use(this.#instance.client.render);
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

    if (this.#instance.noClient) {
      listen();
    } else {
      this.#instance.hooks["client:first-build:done"].tap("Server", listen);
    }
  }
  stop() {
    this.server.close();
  }
  use(...args) {
    this.app.use(...args);
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
