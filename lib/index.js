const Campbell = require("./core");
const CORE_PLUGINS = require("./core-plugins");

CORE_PLUGINS.forEach(Plugin => {
  Campbell.use(Plugin);
});

module.exports = Campbell;
