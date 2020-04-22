const { EventEmitter2 } = require("eventemitter2");
const Alton = require("alton");

class Task extends EventEmitter2 {
  constructor(instance, options) {
    super({ wildcard: true });
    this.instance = instance;
    this.$options = options;

    let { name, run, props } = options;
    if (!name) throw new Error("tasks must have a name");
    if (typeof run !== "function")
      throw new Error(
        `task ${name} must have the property "run" and it must be a function`
      );

    this.$propsSchema = new Alton(props || {});

    Object.assign(this, options);

    delete this[props];
  }
  _run(props = {}) {
    this.props = this.$propsSchema.load(props);
    this.run(this.props);
  }
}

module.exports = Task;
