module.exports = function() {
  // register plugins found in config
  for (var declaration of this.config.get("plugins")) {
    let pluginPath;

    let createOptions = () => ({});

    if (typeof declaration === "string") {
      pluginPath = this.resolvePath(declaration);
    } else if (Array.isArray(declaration)) {
      // declaration is [pluginPath: string,options: object|function,bind: boolean]
      let [pluginSrc, options, bind] = declaration;

      // extract path
      pluginPath = this.resolvePath(pluginSrc);

      // decide wether to bind the "createOptions" function or not (handle undefined case)
      bind = bind === false ? false : true;

      // overwrite the "createOptions" function
      if (typeof options === "object") {
        createOptions = function() {
          return options;
        };
      } else if (typeof options === "function") {
        createOptions = bind ? options.bind(this) : options;
      } else
        throw new Error(
          "plugins options must be an object or a function that returns an object"
        );
    } else throw new Error(`unsupported plugin declaration ${declaration}`);

    this.plugins.register(pluginPath, createOptions);
  }
};
