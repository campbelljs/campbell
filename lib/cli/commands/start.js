const Campbell = require("../../index.js");

module.exports = {
  command: "start [port]",
  describe: "Start the campbell server in current dir",
  handler: argv => {
    const { port } = argv;
    if (port) process.env.CAMPBELL_SERVER_PORT = port;

    if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

    let instance = Campbell.createFromDir(process.cwd());

    instance.init().then(() => {
      instance.start();
    });
  }
};
