const fs = require("fs-extra");
const path = require("path");

class Cli {
  #app;
  #yargs;
  constructor(app) {
    this.#app = app;
    this.load();
  }
  load() {
    const yargs = require("yargs").scriptName(this.#app.name);
    this.#yargs = yargs;

    let app = this.#app;
    yargs.middleware(argv => {
      let $ = { app };
      return { $, ...argv };
    });

    // add any command found in the commands directory
    this.addCommandsFromDir(path.join(__dirname, "./commands"));

    // listener
    this.listener = function listener(data) {
      let str = data.toString().trim();
      let args = str.split(" ");
      yargs.parse(args);
    };

    // listen to stdin
    process.stdin.on("data", this.listener);
  }
  reload() {
    // remove previous listener
    process.stdin.removeListener("data", this.listener);
    this.load();
  }
  addCommand(command) {
    this.#yargs.command(command);
  }
  addCommandsFromDir(dir) {
    fs.readdirSync(dir)
      .map(name => require(path.join(dir, name)))
      .forEach(this.addCommand, this);
  }
  static create(app) {
    return new Cli(app);
  }
}

module.exports = Cli;
