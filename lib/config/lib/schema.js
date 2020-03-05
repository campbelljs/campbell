const _ = require("lodash");

class Schema {
  constructor(definition) {
    this.definition = definition;
  }
  getDefaults() {
    let defaults = _.cloneDeepWith(this.definition, function(value) {
      if (_.has(value, "default")) {
        return value.default;
      }
    });
    return defaults;
  }
}

module.exports = Schema;
