const {
  LIFECYCLE_HOOKS,
  isPromise,
  invokeWithErrorHandling,
} = require("../utils");

exports.initLifecycle = function (cm) {
  const options = cm.$options;

  const parent = options.parent;

  cm.$parent = parent;

  cm.$root = parent ? parent.$root : cm;
  cm.$children = new Set();

  cm._lifecycle = {
    state: {},
    callHook(name) {
      if (!cm.$options[name]) return;
      let hookType = LIFECYCLE_HOOKS[name];
      if (!hookType) throw new Error(`UnknownHook: ${name}`);
      else if (hookType === "Sync") {
        for (const handler of cm.$options[name]) {
          if (typeof handler !== "function") {
            throw new TypeError(
              `BadHookHandler: handlers for '${name}' must be functions`
            );
          }
          invokeWithErrorHandling(handler, cm, null, cm, `${name} hook`);
        }
        return;
      } else if (hookType === "Async") {
        return new Promise((resolve) => {
          for (const handler of cm.$options[name]) {
            if (typeof handler !== "function") {
              throw new TypeError(
                `BadHookHandler: handlers for '${name}' must be functions`
              );
            }
            let promise = handler.call(cm);
            if (isPromise(promise)) promise.then(resolve);
          }
          resolve();
        });
      }
    },
  };
  Object.keys(LIFECYCLE_HOOKS).forEach((hookName) => {
    if (!/^before/.test(hookName)) {
      let capitalized = hookName.charAt(0).toUpperCase() + hookName.slice(1);
      cm._lifecycle.state[`isBeing${capitalized}`] = false;
      cm._lifecycle.state[`is${capitalized}`] = false;
    }
  });
};

exports.lifecycleMixin = function (Campbell) {
  Campbell.prototype.$mount = async function () {
    if (this._lifecycle.state.isBeingMounted) {
      return;
    }
    this._lifecycle.state.isBeingMounted = true;
    await this._lifecycle.callHook("beforeMount");

    this._lifecycle.state.isMounted = true;
    this._lifecycle.callHook("mounted");
  };
  Campbell.prototype.$destroy = function () {
    if (this._lifecycle.state.isBeingDestroyed) {
      return;
    }
    this._lifecycle.callHook("beforeDestroy");
    this._lifecycle.state.isBeingDestroyed = true;
    // remove self from parent
    const parent = this.$parent;
    if (parent && !parent._lifecycle.state.isBeingDestroyed) {
      // TODO: add propper deletion action
      delete parent[this.$options._mountPath];
    }

    this._lifecycle.state.isDestroyed = true;
    this._lifecycle.callHook("destroyed");
    // this.$off();
  };
};
