let http = require("http");

class Server {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    instance.registerHooks(require("./hooks"));

    this.app = require("express")();
    this.middlewares = require("@mathistld/connectr")(this.app);
    this.http = http.createServer(this.app);

    this.loaders = [...require("./scan/loaders")];

    // this._static = {
    //   resolve: [
    //     /\.(html|css|js)$/,
    //     /\.(png|jpe?g|gif|webp|svg)$/,
    //     /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
    //     /\.(woff2?|eot|ttf|otf)$/
    //   ],
    //   ignore: [/.router.js$/, /.socket.js$/]
    // };

    instance.hooks["init"].tap("Server", this.init.bind(this));
    instance.hooks["start"].tap("Server", this.start.bind(this));
  }
  init() {
    // plugins already installed

    require("./security").call(this.#instance);
    // scan the public dir for routers
    require("./scan").call(this.#instance);
  }
  start() {
    let port = this.config.get("server.port");
    let url = this.url;
    let logger = this.#instance.logger;

    this.http.listen(port, () => {
      logger.info(`server available at ${url}`);
    });
  }
  stop() {
    this.server.close();
  }
  use(...args) {
    return this.app.use(...args);
  }
  // resolveStatic(path) {
  //   return this._static.resolve.some(regexp => regexp.test(path));
  // }
  // ignoreStatic(path) {
  //   return this._static.ignore.some(regexp => regexp.test(path));
  // }
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
