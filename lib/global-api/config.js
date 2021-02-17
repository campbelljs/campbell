const { optionMergeStrategies } = require("../utils");

module.exports = function (Campbell) {
  Campbell.config = {
    silent: false,
    optionMergeStrategies,
    pluginInstallMiddlewares: [],
  };
};
