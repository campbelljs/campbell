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
      require("./register-plugins").bind(instance)
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
    let instance = this.#instance;
    let plugin = this.loadPlugin(pluginPath);
    let name = plugin.name;

    let entry = {
      name,
      installed: false,
      plugin
    };

    let install = async function() {
      // install methods and getters
      let { methods, getters } = plugin;
      for (var getter of Object.values(getters || {})) {
        this.defineGetter(getter);
      }
      for (var method of Object.values(methods || {})) {
        this.defineMethod(method);
      }

      // call the plugin's "install" method
      await plugin.install.call(this, createOptions());
      instance.logger.verbose(`istalled plugin : ${name}`);
      entry.installed = true;
    }.bind(instance);

    instance.hooks["plugins:install"].tapPromise(name, install);

    this.registry.push(entry);
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
  static create(instance) {
    return new PluginCentral(instance);
  }
}

module.exports = PluginCentral;