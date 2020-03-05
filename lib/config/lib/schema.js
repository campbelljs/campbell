const _ = require("lodash");
const Format = require("./format");

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

    this.injectFormats();
  }
  enumerate(callback) {
    this.keys.forEach(function(key) {
      let val = _.get(this.definition, key);
      callback(key, val);
    }, this);
  }
  injectFormats() {
    let definition = this.definition;
    this.enumerate((key, val) => {
      let format;
      switch (typeof val.format) {
        case "object":
          format = new Format(val.format);
          break;
        case "string":
          format = Format.get(val.format);
          break;
        default:
          format = new Format();
      }

      val.format = format;
    });
  }
  getDefaults() {
    let defaults = {};
    this.enumerate((key, val) => _.setWith(defaults, key, val.default, Object));
    return defaults;
  }
  validate(config) {
    console.log(this.definition);
    let definition = this.definition;
    this.enumerate((key, def) => {
      let format = def.format;
      let val = config.get(key);

      let valid;
      try {
        valid = format.validate(val);
      } catch (e) {
        valid = false;
      }
      if (!valid) {
        if (format.name)
          throw new Error(`${key} must match format : ${format.name}`);
        throw new Error(`${key} don't match its format`);
      }
    });
  }
  static registerFormat(name, definition) {
    Format.register(name, definition);
  }
}

module.exports = Schema;
