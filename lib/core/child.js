const { handleError } = require("../utils");

function validatePath(cm, path) {
  if (typeof path !== "string" || !path) {
    throw new Error("BadMountPath: path must be a non-empty string");
  }
}

exports.childMixin = function (Campbell) {
  Campbell.prototype.$addChild = function (componentDeclaration, options) {
    let decType = typeof componentDeclaration;
    let Component;
    if (decType === "object") {
      Component = Campbell.extend(componentDeclaration);
    } else if (decType === "function") {
      Component = componentDeclaration;
    } else if (decType === "string") {
      Component = this.$getComponent(componentDeclaration);
      if (!Component)
        handleError(
          `Can't find component with name ${componentDeclaration}`,
          this,
          "addChild"
        );
    } else {
      throw new Error("Invalid Component Declaration");
    }
    let child = new Component({
      parent: this,
      ...options,
    });
    this.$children.add(child);
    return child;
  };
  Campbell.prototype.$removeChild = function (child) {
    this.$children.delete(child);

    const { _mountPath } = child.$options;
    if (_mountPath && this[_mountPath] === child) delete this[_mountPath];
  };
  Campbell.prototype.$addChildWithPath = function (
    path,
    componentDeclaration,
    options = {}
  ) {
    validatePath(this, path);
    let child = this.$addChild(componentDeclaration, {
      ...options,
      _mountPath: path,
    });
    this[path] = child;
    return child;
  };
  Campbell.prototype.$forceReload = async function () {
    if (!this.$parent) throw new Error("can't reload root instance");
    const parent = this.$parent;
    const Ctor = this.__proto__.constructor;
    const { _mountPath } = this.$options;
    const { _options: opts } = this;
    const newInstance = _mountPath
      ? parent.$addChildWithPath(_mountPath, Ctor, opts)
      : parent.$addChild(Ctor, opts);
    await newInstance.$mount();

    parent.$removeChild(this);
    await this.$destroy();
  };
};
