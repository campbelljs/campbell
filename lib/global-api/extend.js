const { proxy, mergeOptions, extend, isPlainObject } = require("../utils");

module.exports = function (Campbell) {
  /**
   * Each instance constructor, including Campbell, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  let cid = 0;
  Campbell.cid = cid;
  cid++;

  /**
   * Class inheritance
   */
  Campbell.extend = function (extendOptions = {}, registerComponent = true) {
    const Super = this;
    const SuperId = Super.cid;
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId];
    }

    const name = extendOptions.name || Super.options.name;

    const Sub = class CampbellComponent extends Super {
      constructor(...args) {
        super(...args);
      }
    };
    if (extendOptions.name) Sub.name = extendOptions.name;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions, null, Super);
    Sub.super = Super;

    // For props and computed properties, we define the proxy getters on
    // the Campbell instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub);
    }
    if (Sub.options.computed) {
      initComputed(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // enable recursive self-lookup
    if (!Sub.options.components) Sub.options.components = {};
    if (registerComponent && name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub;
  };

  Campbell.options.components || (Campbell.options.components = {});
  Campbell.component = function (name, options) {
    if (typeof name !== "string" || !name) {
      throw new Error("Invalid component name");
    }
    if (!options.name) options.name = name;
    let Component;
    if (typeof options === "function") {
      Component = options;
    } else if (isPlainObject(options)) {
      Component = this.extend(options, false);
    }
    if (name in this.options.components) {
      console.warn(`A Component with name ${name} is already registered`);
    }
    this.options.components[name] = Component;
  };
  Campbell.getComponent = function (name) {
    return (
      this.options.components[name] ||
      (this.super ? this.super.getComponent(name) : null)
    );
  };
  Campbell.prototype.$getComponent = function (...args) {
    return this.__proto__.constructor.getComponent(...args);
  };
};

function initProps(Comp) {
  const props = Comp.options.props;
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key);
  }
}

function initComputed(Comp) {
  const computed = Comp.options.computed;
  for (const key in computed) {
    let computedDeclaration = computed[key];
    let propertyDefinition =
      typeof computedDeclaration === "function"
        ? { get: computedDeclaration }
        : computedDeclaration;
    Object.defineProperty(Comp.prototype, key, propertyDefinition);
  }
}
