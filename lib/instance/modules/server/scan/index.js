module.exports = function() {
  require("./router").call(this);
  require("./socket").call(this);
};
