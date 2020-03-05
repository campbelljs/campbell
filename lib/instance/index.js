const path = require("path");
const fs = require("fs-extra");

const Config = require("../config");

const Cli = require("../cli");
const Logger = require("../logger");
const Server = require("../server");
const Client = require("../client");

class Instance {
  constructor(config) {
    this.config = new Config(config);
  }
  init() {
    this.cli = Cli.create(this);
    this.logger = Logger.create(this);
    this.server = Server.create(this);
    this.client = Client.create(this);

    require("./core/init").call(this);

    this.installPlugins();

    if (!this.noServer) this.server.init();
    if (!this.noClient) this.client.init();
  }
  start() {
    this.init();

    if (!this.noServer) this.server.start();
    if (!this.noClient) this.client.start();
  }

  installPlugin(plugin) {
    if (!plugin.installed) {
      if (plugin.install) {
        plugin.install.call(this, plugin.options);
      }
    }
  }
  installPlugins() {
    Instance.plugins.forEach(function(plugin) {
      this.installPlugin(plugin);
    }, this);
  }
  static defineGetter(getter) {
    let name = getter.name;
    if (!name) throw new Error("getters must have names");

    Object.defineProperty(Instance.prototype, name, {
      get: getter
    });
  }
  static defineMethod(method) {
    let name = method.name;
    if (!name) throw new Error("methods must have names");

    Instance.prototype[name] = method;
  }
  static registerPlugin(plugin, options) {
    let { methods, getters } = plugin;

    // install getters
    for (var getter of Object.values(getters || {})) {
      Instance.defineGetter(getter);
    }
    // install methods
    for (var method of Object.values(methods || {})) {
      Instance.defineMethod(method);
    }

    plugin.options = options;
    plugin.installed = false;
    Instance.plugins.push(plugin);
  }
  static createFromDir(dir) {
    let config = {};

    // check for a config file
    let configFilePath = path.resolve(dir, "config.js");
    if (fs.pathExistsSync(configFilePath)) {
      config = require(configFilePath);
    }

    let instance = new Instance(config);
    return instance;
  }
  static plugins = [];
}

// install core getters
for (var getter of Object.values(require("./core/getters")) || []) {
  Instance.defineGetter(getter);
}
// install core methods
for (var method of Object.values(require("./core/methods")) || []) {
  Instance.defineMethod(method);
}

module.exports = Instance;
