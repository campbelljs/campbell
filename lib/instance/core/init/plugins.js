module.exports = function() {
  // register plugins found in config
  for (var declaration of this.config.get("plugins")) {
    let pluginPath;
    let options;
    if (typeof declaration == "string") {
      pluginPath = this.resolvePath(declaration);
    } else if (Array.isArray(declaration)) {
      pluginPath = this.resolvePath(declaration[0]);
      options = declaration[1];
    }
    let plugin = require(pluginPath);

    this.constructor.registerPlugin(plugin, options);
  }
};
