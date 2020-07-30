const Campbell = require("../../index.js");

module.exports = {
  command: "build",
  describe: "Build the campbell server in current dir",
  handler: (argv) => {
    if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

    let instance = Campbell.createFromDir(process.cwd());
    const { logger } = instance;

    instance.init().then(async () => {
      await instance.build();
      logger.info("build done");
      process.exit(0);
    });
  },
};
