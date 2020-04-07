module.exports = function() {
  require("./client").call(this);

  require("./security").call(this);
  require("./router").call(this);
  require("./socket").call(this);

  require("./plugins").call(this);
};
