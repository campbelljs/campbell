class Format {
  constructor(definition) {
    this.definition = definition;
    this.name = definition ? definition.name : undefined;
  }
  validate(value) {
    if (this.definition && this.definition.validate)
      return this.definition.validate(value);
    return true;
  }
  coerce(value) {
    if (this.definition && this.definition.validate)
      return this.definition.coerce(value);
    return value;
  }
  static get(name) {
    let format = Format.formats[name];
    if (!format) throw new Error(`Unknown format ${name}`);
    else return format;
  }
  static register(name, definition) {
    definition.name = name;
    let format = new Format(definition);
    Format.formats[name] = format;
  }
  static formats = {};
}

let definitions = {
  number: {
    validate: val => Number.prototype.toString.call(val) == val.toString(),
    coerce: val => Number(val)
  },
  boolean: {
    validate: val => Boolean.prototype.toString.call(val) == val.toString(),
    coerce: function(string) {
      switch (string.toLowerCase().trim()) {
        case "true":
        case "yes":
        case "1":
          return true;
        case "false":
        case "no":
        case "0":
        case null:
          return false;
        default:
          return Boolean(string);
      }
    }
  },
  string: {
    validate: val => String.prototype.toString.call(val) == val.toString()
  },
  function: {
    validate: val => Function.prototype.toString.call(val) == val.toString(),
    coerce: val => val.parseFunction()
  },
  object: {
    validate: val => Object.prototype.toString.call(val) == val.toString(),
    coerce: val => JSON.parse(val)
  },
  array: {
    validate: val => Array.prototype.toString.call(val) == val.toString(),
    coerce: val => JSON.parse(val)
  },
  regexp: {
    validate: val => RegExp.prototype.toString.call(val) == val.toString(),
    coerce: val => RegExp(val)
  }
};
for (var name in definitions) {
  if (definitions.hasOwnProperty(name)) {
    let definition = definitions[name];
    Format.register(name, definition);
  }
}

module.exports = Format;
