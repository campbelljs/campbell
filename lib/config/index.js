const _ = require("lodash");
// const convict = require("convict");
// convict.addFormats(require("./formats"));

const schema = require("./schema");

class Config {
  constructor(obj) {
    _.assign(this, schema.getDefaults());
    this.assignEnv();
    console.log(this);
    _.merge(this, obj);
  }
  assignEnv() {
    // TODO: change type of strings from env var if needed
    schema.enumerate(
      function(key, def) {
        let { env } = def;
        if (env) {
          let val = process.env[env];
          if (!_.isUndefined(val)) {
            _.setWith(this, key, val, Object);
          }
        }
      }.bind(this)
    );
  }
  get(path) {
    return _.get(this, path);
  }
}

module.exports = Config;
