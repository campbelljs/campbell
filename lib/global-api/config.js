const { optionMergeStrategies } = require("../utils/options");

module.exports = function (Campbell) {
  Campbell.config = {
    silent: false,
    logLevel: "info",
    optionMergeStrategies,
    pluginInstallMiddlewares: [],
  };
};
