const Campbell = require("../../index.js");

module.exports = {
  command: "start (dev) [port]",
  describe: "Start the campbell server in current dir in dev mode",
  handler: argv => {
    const { port, inspectorPort, inspectorHost, inspectorWait } = argv;
    if (port) process.env.CAMPBELL_SERVER_PORT = port;
    require("inspector").open(inspectorPort, inspectorHost, inspectorWait);
    if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";

    let instance = Campbell.createFromDir(process.cwd());

    instance.init().then(() => {
      instance.start();
    });
  }
};
