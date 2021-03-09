module.exports = function (Campbell) {
  require("./config")(Campbell);
  require("./logger")(Campbell);
  require("./extend")(Campbell);
  require("./mixin")(Campbell);
  require("./use")(Campbell);
};
