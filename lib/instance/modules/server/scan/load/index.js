const path = require("path");

function parseRoute(src, baseDir) {
  let route = src.replace(baseDir, "").split(path.sep);
  let name = path.parse(src).name.replace(/\..*$/, "");
  // remove last item (name)
  route.pop();
  // add name at tail
  if (name !== "index") route.push(name);
  // route params
  route = route.map(name => name.replace(/^\_(?!\_)/, ":"));
  // get final route string
  route = route.join("/");
  return route;
}

module.exports = function(src, baseDir, route) {
  const loaders = this.server.loaders;
  let route = parseRoute(src, baseDir);

  for (var loader of loaders) {
    if (loader.test.call(this, src, baseDir, route)) {
      loader.load.call(this, { src, baseDir, route });
      return true;
    }
  }
  return false;
};
