const { extend, proxy, mergeOptions, validateProp } = require("../utils");
const { initLifecycle } = require("./lifecycle");

function resolveConstructorOptions(Ctor) {
  let options = Ctor.options;
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super);
    const cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(
        superOptions,
        Ctor.extendOptions,
        null,
        Ctor
      );
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options;
}
function resolveModifiedOptions(Ctor) {
  let modified;
  const latest = Ctor.options;
  const sealed = Ctor.sealedOptions;
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {};
      modified[key] = latest[key];
    }
  }
  return modified;
}

let uid = 0;

exports.initMixin = function (Campbell) {
  Campbell.prototype._init = function (options = {}) {
    let cm = this;
    cm._uid = uid++;

    const _options = options || {};
    cm.$options = mergeOptions(
      resolveConstructorOptions(cm.constructor),
      _options,
      cm
    );
    cm._options = _options;

    initLifecycle(cm);

    const opts = cm.$options;
    if (opts.props) initProps(cm, opts.props);
    if (opts.methods) initMethods(cm, opts.methods);
    if (opts.computed) initComputed(cm, opts.computed);

    this._lifecycle.callHook("beforeCreate");
    this._lifecycle.callHook("created");
  };
};

function initProps(cm, propsOptions) {
  const propsData = cm.$options.propsData || {};
  const props = (cm._props = {});

  for (const key in propsOptions) {
    const value = validateProp(key, propsOptions, propsData, cm);
    props[key] = value;
    // static props are already proxied on the component's prototype
    // during Campbell.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in cm)) {
      proxy(cm, `_props`, key);
    }
  }
}
function initMethods(cm, methodsOptions) {
  for (const key in methodsOptions) {
    let method = methodsOptions[key];
    cm[key] = method.bind(cm);
  }
}
function initComputed(cm, computedOptions) {
  for (const key in computedOptions) {
    let computedDeclaration = computedOptions[key];
    let propertyDefinition =
      typeof computedDeclaration === "function"
        ? { get: computedDeclaration }
        : computedDeclaration;
    Object.defineProperty(cm, key, propertyDefinition);
  }
}
