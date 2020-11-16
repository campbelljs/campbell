const path = require("path");
const fs = require("fs-extra");

const tapable = require("tapable");
const { EventEmitter2 } = require("eventemitter2");

const createConfig = require("../config");

const Logger = require("./modules/logger");
const PluginCentral = require("./modules/plugin-central");
const TaskManager = require("./modules/task-manager");
const Server = require("./modules/server");

class Instance {
  constructor(config) {
    this.hooks = {};
    Object.defineProperty(this.hooks, "_tapable", {
      value: require("tapable")
    });
    this._emitter = new EventEmitter2({ wildcard: true });

    this.config = createConfig(config);

    require("./core").call(this);

    this.logger = Logger.create(this);
    this.plugins = PluginCentral.create(this);
    this.tasks = TaskManager.create(this);
    if (!this.noServer) this.server = Server.create(this);
  }
  async init() {
    await this.plugins.install();

    await this.hooks["init"].promise();
  }
  async build() {
    await this.hooks["build:before"].promise();
    await this.hooks["build"].promise();
    await this.hooks["build:after"].promise();
  }
  async start() {
    await this.build();

    await this.hooks["start:before"].promise();
    this.hooks["start"].call();
  }
  async stop() {
    await this.hooks["stop:before"].promise();
    this.hooks["stop"].call();
  }
  registerHook(name, hook) {
    if (this.hooks.hasOwnProperty(name))
      throw new Error(`hook ${name} already exists`);
    this.hooks[name] = hook;
  }
  registerHooks(obj) {
    Object.entries(obj).forEach(function([name, hook]) {
      this.registerHook(name, hook);
    }, this);
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
    let configFilePath = path.resolve(dir, "campbell.config.js");
    if (fs.pathExistsSync(configFilePath)) {
      config = require(configFilePath);
    } else {
      // try with json
      configFilePath = path.resolve(dir, "campbell.config.json");
      if (fs.pathExistsSync(configFilePath)) {
        config = require(configFilePath);
      }
    }

    let instance = new Instance(config);
    return instance;
  }
  static createWorkerFromDir(dir, debug) {
    let config = {};

    // check for a config file
    let configFilePath = path.resolve(dir, "campbell.config.js");
    if (fs.pathExistsSync(configFilePath)) {
      config = require(configFilePath);
    }
    const WorkerInstance = require("./worker");
    let instance = new WorkerInstance(config, debug);
    return instance;
  }
  static plugins = [];
}

module.exports = Instance;
