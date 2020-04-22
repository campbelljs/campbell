module.exports = function(src, baseDir) {
  if (/.router.js$/.test(src)) require("./router").call(this, src, baseDir);
  else if (/.socket.js$/.test(src))
    require("./socket").call(this, src, baseDir);
};
