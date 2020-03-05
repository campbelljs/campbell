module.exports = function() {
  require("./security").call(this);
  require("./router").call(this);
  require("./socket").call(this);
};
