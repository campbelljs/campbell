module.exports = function (Campbell) {
  ["./config", "./logger", "./extend", "./mixin", "./use"].forEach((m) => {
    require(m)(Campbell);
  });
};
