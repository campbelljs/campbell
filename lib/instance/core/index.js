// this must be called with the instance as context
module.exports = function() {
  // install core getters
  for (var getter of Object.values(require("./getters")) || []) {
    this.defineGetter(getter);
  }
  // install core methods
  for (var method of Object.values(require("./methods")) || []) {
    this.defineMethod(method);
  }
};
