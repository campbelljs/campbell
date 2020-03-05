let http = require("http");

class Server {
  #app;
  constructor(app) {
    this.#app = app;

    this.app = require("express")();
    this.http = http.createServer(this.app);
    this.io = require("socket.io")(this.http);
  }
  init() {
    // AFTER API
    if (!this.#app.noClient) this.use(this.#app.client.render);
  }
  start() {
    let port = this.config.get("server.port");
    let url = this.url;
    let logger = this.#app.logger;

    this.http.listen(port, () => {
      logger.info(`server available at ${url}`);
    });
  }
  stop() {
    this.server.close();
  }
  use(...args) {
    this.app.use(...args);
  }
  get config() {
    return this.#app.config;
  }
  get url() {
    let { ssl, host, port } = this.config.get("server");
    return `${ssl.enabled ? "https" : "http"}://${host}:${port}`;
  }
  static create(app) {
    return new Server(app);
  }
}

module.exports = Server;
