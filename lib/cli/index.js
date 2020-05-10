#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");

const yargs = require("yargs");

let commands = [];

fs.readdirSync(path.resolve(__dirname, "commands")).forEach(filePath => {
  let commandSrc = path.resolve(path.resolve(__dirname, "commands", filePath));
  let command = require(commandSrc);
  commands.push(command);
  yargs.command(command);
});

yargs.help().argv;
