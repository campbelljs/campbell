#!/usr/bin/env node --experimental-worker
const path = require("path");
const Campbell = require("../index.js");
let instance = Campbell.createFromDir(process.cwd());

instance.start();
