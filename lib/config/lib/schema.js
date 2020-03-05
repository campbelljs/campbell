const _ = require("lodash");

function traverse(obj, path, callback, hasChild = val => true) {
  let node;
  if (!path) {
    node = obj;
  } else {
    node = _.get(obj, path);
  }
  for (let prop in node) {
    let child = node[prop];
    let childPath = path ? `${path}.${prop}` : prop;
    if (child && typeof child === "object" && hasChild(child)) {
      traverse(obj, childPath, callback, hasChild);
    } else {
      callback(childPath, child);
    }
  }
}

class Schema {
  constructor(definition) {
    this.definition = definition;
    this.keys = [];

    // get keys
    traverse(
      this.definition,
      "",
      function(path) {
        this.keys.push(path);
      }.bind(this),
      node => !node.hasOwnProperty("default")
    );
  }
  enumerate(callback) {
    this.keys.forEach(function(key) {
      let val = _.get(this.definition, key);
      callback(key, val);
    }, this);
  }
  getDefaults() {
    let defaults = {};
    this.enumerate((key, val) => _.setWith(defaults, key, val.default, Object));
    return defaults;
  }
}

module.exports = Schema;
