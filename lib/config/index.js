const schema = require("./schema");

function createConfig(obj) {
  let config = schema.load(obj);
  config.validate();
  return config;
}

module.exports = createConfig;
