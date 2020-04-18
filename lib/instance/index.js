const path = require("path");
const fs = require("fs-extra");

const tapable = require("tapable");
const { EventEmitter2 } = require("eventemitter2");

const createConfig = require("../config");

const Logger = require("./modules/logger");
const PluginCentral = require("./modules/plugin-central");
const Server = require("./modules/server");
const Client = require("./modules/client");

class Instance {
  constructor(config) {
    this.hooks = {};
    this._emitter = new EventEmitter2({ wildcard: true });

    this.config = createConfig(config);

    require("./core").call(this);

    this.logger = Logger.create(this);
    this.plugins = PluginCentral.create(this);
    if (!this.noServer) this.server = Server.create(this);
    if (!this.noClient) this.client = Client.create(this);
  }
  async init() {
    await this.plugins.install();

    if (!this.noClient) this.client.init();
    if (!this.noServer) this.server.init();
  }
  registerHook(name, hook) {
    if (this.hooks.hasOwnProperty(name))
      throw new Error(`hook ${name} already exists`);
    this.hooks[name] = hook;
  }
  start() {
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
  defineGetter(getter) {
    let name = getter.name;
    if (!name) throw new Error("getters must have names");
    if (this.hasOwnProperty(name))
      throw new Error(`instance already has the property ${name}`);
    Object.defineProperty(this, name, {
      get: getter
    });
  }
  defineMethod(method) {
    let name = method.name;
    if (!name) throw new Error("methods must have names");
    if (this.hasOwnProperty(name))
      throw new Error(`instance already has the property ${name}`);
    Object.defineProperty(this, name, {
      enumerable: false,
      value: method
    });
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

module.exports = Instance;
