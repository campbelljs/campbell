const { extend, toRawType, isPlainObject, hasOwn, warn } = require("./misc");
const { LIFECYCLE_HOOKS } = require("./lifecycle");

function normalizeProps(options) {
  const props = options.props;
  if (!props) return;
  const res = {};
  let val, name;
  if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key];
      name = key;
      res[name] = isPlainObject(val) ? val : { type: val };
    }
  } else {
    throw new Error("BadPropsDeclaration: props must be an object");
  }
  options.props = res;
}

// Merging

// strategies
const strats = {
  default: function(parentVal, childVal) {
    return childVal === undefined ? parentVal : childVal;
  }
};
exports.optionMergeStrategies = strats;

function mergeHook(parentVal, childVal) {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
      ? childVal
      : [childVal]
    : parentVal;
  return res ? dedupeHooks(res) : res;
}

function dedupeHooks(hooks) {
  const res = [];
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res;
}

Object.keys(LIFECYCLE_HOOKS).forEach(key => {
  strats[key] = mergeHook;
});

strats.props = strats.methods = strats.computed = function(
  parentVal,
  childVal,
  cm,
  key
) {
  if (childVal) {
    assertObjectType(key, childVal, cm);
  }
  if (!parentVal) return childVal;
  const ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) extend(ret, childVal);
  return ret;
};

exports.mergeOptions = function mergeOptions(parent, child, cm, Ctor) {
  if (typeof child === "function") {
    child = child.options;
  }

  normalizeProps(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      let Extends;
      if (typeof child.extends === "string") {
        Extends = Ctor.getComponent(child.extends);
        if (!Extends)
          throw new Error(`can't find component with name ${child.extends}`);
      } else {
        Extends = child.extends;
      }
      parent = mergeOptions(parent, Extends, cm, Ctor);
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], cm, Ctor);
      }
    }
  }

  const options = {};
  let key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    const strat = strats[key] || strats.default;
    options[key] = strat(parent[key], child[key], cm, key);
  }
  return options;
};

function assertObjectType(name, value, cm) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
        `but got ${toRawType(value)}.`,
      cm
    );
  }
}
