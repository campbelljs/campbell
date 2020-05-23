const winston = require("winston");
const { createLogger, format, transports } = winston;

const errorPrinter = format((info, opts) => {
  if (info instanceof Error || !!info.stack) {
    info.message = info.stack;
  }
  return info;
});

const Logger = {
  create(instance) {
    let isDev = instance.isDev;

    let config = {
      level: isDev ? "debug" : "info",
      format: winston.format.combine(errorPrinter(), format.cli()),
      transports: [new transports.Console()]
    };

    let logger = createLogger(config);
    return logger;
  }
};

module.exports = Logger;
