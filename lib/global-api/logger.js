const winston = require("winston");
const { createLogger, format, transports } = winston;

const errorPrinter = format((info /*, opts */) => {
  if (info instanceof Error || !!info.stack) {
    info.message = info.stack;
  }
  return info;
});

module.exports = Campbell => {
  let config = {
    level: Campbell.config.logLevel,
    format: winston.format.combine(errorPrinter(), format.cli()),
    transports: [new transports.Console()]
  };

  let logger = createLogger(config);

  Campbell.prototype.logger = logger;
  Campbell.logger = logger;
  // TODO: maybe set a global or override console
  return logger;
};
