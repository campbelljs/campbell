module.exports = function(Campbell) {
  Campbell._plugins = [];

  Campbell.use = function(plugin, ...options) {
    this._plugins.push(plugin);

    // install method
    if (plugin.install && typeof plugin.install === "function") {
      plugin.install(this, ...options);
    } else {
      throw new Error("Plugins must have an install method");
    }

    Campbell.config.pluginInstallMiddlewares.forEach((middleware, i) => {
      if (typeof middleware !== "function") {
        throw new TypeError(
          `Plugin Install Middlewares should be functions but n°${i} is not (got ${middleware})`
        );
      } else {
        middleware(this, plugin, ...options);
      }
    });
  };
};
