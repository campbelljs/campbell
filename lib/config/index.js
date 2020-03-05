const _ = require("lodash");

const schema = require("./schema");

class Config {
  constructor(obj) {
    _.assign(this, schema.getDefaults());
    this.assignEnv();
    _.merge(this, obj);
    schema.validate(this);
  }
  assignEnv() {
    schema.enumerate(
      function(key, def) {
        let { env, format } = def;
        if (env) {
          let val = process.env[env];
          if (!_.isUndefined(val)) {
            if (format) {
              val = format.coerce(val);
            }
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
