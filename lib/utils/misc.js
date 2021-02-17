// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef(v) {
  return v === undefined || v === null;
}
exports.isUndef = isUndef;

function isDef(v) {
  return v !== undefined && v !== null;
}
exports.isDef = isDef;

function isTrue(v) {
  return v === true;
}
exports.isTrue = isTrue;

function isFalse(v) {
  return v === false;
}
exports.isFalse = isFalse;

// Type Checking
function toRawType(value) {
  return _toString.call(value).slice(8, -1);
}
exports.toRawType = toRawType;

function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
exports.isObject = isObject;

const _toString = Object.prototype.toString;
function isPlainObject(obj) {
  return _toString.call(obj) === "[object Object]";
}
exports.isPlainObject = isPlainObject;
function isRegExp(v) {
  return _toString.call(v) === "[object RegExp]";
}
exports.isRegExp = isRegExp;

function isPromise(val) {
  return (
    isDef(val) &&
    typeof val.then === "function" &&
    typeof val.catch === "function"
  );
}
exports.isPromise = isPromise;

const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
exports.hasOwn = hasOwn;

function proxy(target, sourceKey, key) {
  let sharedPropertyDefinition = {
    get: function proxyGetter() {
      return this[sourceKey][key];
    },
    set: function proxySetter(val) {
      this[sourceKey][key] = val;
    }
  };

  Object.defineProperty(target, key, sharedPropertyDefinition);
}
exports.proxy = proxy;

function extend(to, _from) {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}
exports.extend = extend;
