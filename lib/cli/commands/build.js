const Campbell = require("../../index.js");

module.exports = {
  command: "build",
  describe: "Build the campbell server in current dir",
  handler: argv => {
    let instance = Campbell.createFromDir(process.cwd());
    const { logger } = instance;

    instance.init().then(async () => {
      await instance.build();
      logger.info("build done");
      process.exit(0);
    });
  }
};
