const path = require("path");
const fs = require("fs-extra");
const { AsyncSeriesHook } = require("tapable");

class PluginCentral {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    instance.registerHook("plugins:before-install", new AsyncSeriesHook());
    instance.registerHook("plugins:install", new AsyncSeriesHook());
    instance.registerHook("plugins:after-install", new AsyncSeriesHook());

    instance.hooks["plugins:before-install"].tap(
      "registerPlugins",
      function() {
        let declarations = this.config.get("plugins");
        this.plugins.registerFromDeclarations(declarations);
      }.bind(instance)
    );

    this.registry = [];
  }
  async install() {
    let instance = this.#instance;

    await instance.hooks["plugins:before-install"].promise();
    await instance.hooks["plugins:install"].promise();
    await instance.hooks["plugins:after-install"].promise();
  }
  register(pluginPath, createOptions) {
    // pluginPath must be absolute
    if (!path.isAbsolute(pluginPath))
      throw new Error("please register plugins with absolute paths");
    let instance = this.#instance;
    let { logger } = instance;
    let plugin = this.loadPlugin(pluginPath);
    let name = plugin.name;

    if (plugin.dependencies) {
      let deps = plugin.dependencies;
      if (!Array.isArray(deps))
        throw new Error(
          `plugin dependencies field must be an Array (at ${name})`
        );
      this.registerFromDeclarations(deps);
    }

    let entry = {
      path: pluginPath,
      dir: fs.lstatSync(fs.realpathSync(pluginPath)).isDirectory()
        ? pluginPath
        : path.dirname(pluginPath),
      name,
      installed: false,
      install: async function() {
        logger.verbose(`istalling plugin : ${name}`);
        if (entry.installed)
          throw new Error(`plugin [${name}] already installed`);
        // install methods and getters
        let { methods, getters, tasks } = plugin;
        for (var getter of Object.values(getters || {})) {
          this.defineGetter(getter);
        }
        for (var method of Object.values(methods || {})) {
          this.defineMethod(method);
        }
        for (var task of tasks || []) {
          this.tasks.register(task);
        }

        // call the plugin's "install" method
        await plugin.install.call(this, createOptions());
        logger.verbose(`istalled plugin : ${name}`);
        entry.installed = true;
      }.bind(instance),
      plugin
    };

    instance.hooks["plugins:install"].tapPromise(name, entry.install);

    this.registry.push(entry);
    return entry;
  }
  parseDeclaration(declaration) {
    const instance = this.#instance;

    let pluginPath;
    let createOptions = () => ({});

    if (typeof declaration === "string") {
      pluginPath = instance.resolvePath(declaration);
    } else if (Array.isArray(declaration)) {
      // declaration is [pluginPath: string,options: object|function,bind: boolean]
      let [pluginSrc, options, bind] = declaration;

      // extract path
      pluginPath = instance.resolvePath(pluginSrc);

      // decide wether to bind the "createOptions" function or not (handle undefined case)
      bind = bind === false ? false : true;

      // overwrite the "createOptions" function
      if (typeof options === "object") {
        createOptions = function() {
          return options;
        };
      } else if (typeof options === "function") {
        createOptions = bind ? options.bind(instance) : options;
      } else
        throw new Error(
          "plugins options must be an object or a function that returns an object"
        );
    } else throw new Error(`unsupported plugin declaration ${declaration}`);

    return { pluginPath, createOptions };
  }
  registerFromDeclaration(declaration) {
    const { pluginPath, createOptions } = this.parseDeclaration(declaration);
    return this.register(pluginPath, createOptions);
  }
  registerFromDeclarations(declarations) {
    for (var declaration of declarations) {
      this.registerFromDeclaration(declaration);
    }
  }
  loadPlugin(pluginPath) {
    let plugin = require(pluginPath);
    this.verifyPlugin(plugin);
    return plugin;
  }
  verifyPlugin(plugin) {
    if (!plugin.name) throw new Error("plugins must have a name");
    if (!plugin.install)
      throw new Error(`plugin ${plugin.name} must have an install method`);

    // when tapping instance.hooks["plugins:install"] we need an identifier (wich is the plugin's name for now)
    if (this.registry.some(({ id }) => id == plugin.name))
      throw new Error(
        `a plugin with name ${plugin.name} has already been registered`
      );
  }
  isInstalled(pluginName) {
    return this.registry.some(
      ({ name, installed }) => installed && name === pluginName
    );
  }
  forEach(...args) {
    this.registry.forEach(...args);
  }
  static create(instance) {
    return new PluginCentral(instance);
  }
}

module.exports = PluginCentral;
