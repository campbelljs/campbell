const path = require("path");
const fs = require("fs-extra");

module.exports = [
  ...fs
    .readdirSync(__dirname)
    .filter(name => name !== "index.js")
    .map(name => require(path.resolve(__dirname, name)))
];
