const Campbell = require("../../index.js");

module.exports = {
  command: "start [port] [dev] [inspect]",
  describe: "Start the campbell server in current dir",
  handler: argv => {
    if (argv.port) process.env.CAMPBELL_SERVER_PORT = argv.port;

    if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
    if (argv.dev) process.env.NODE_ENV = "development";
    if (argv.inspect) require("inspector").open();

    let instance = Campbell.createFromDir(process.cwd());

    instance.init().then(() => {
      instance.start();
    });
  }
};
