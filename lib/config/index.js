const _ = require("lodash");
// const convict = require("convict");
// convict.addFormats(require("./formats"));

const schema = require("./schema");

class Config {
  constructor(obj) {
    _.assign(this, schema.getDefaults());
    _.merge(this, obj);
  }
  get(path) {
    return _.get(this, path);
  }
}

module.exports = Config;
