#!/usr/bin/env node
const Campbell = require("../index.js");
let instance = Campbell.createFromDir(process.cwd());

instance.init().then(() => {
  instance.start();
});
