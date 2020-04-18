const winston = require("winston");
const { createLogger, format, transports } = winston;

// const errorStackTracerFormat = winston.format(info => {
//   if (info.stack) {
//     info.message = info.stack;
//   }
//   return info;
// });
class Logger {
  static create(instance) {
    let isDev = instance.isDev;

    let config = {
      level: isDev ? "debug" : "info",
      format: winston.format.combine(
        // winston.format.splat(), // Necessary to produce the 'meta' property
        // errorStackTracerFormat(),
        // winston.format.simple(),
        format.cli()
      ),
      transports: [new transports.Console()]
    };

    // if (configure) Object.assign(config, configure(winston));

    let logger = createLogger(config);
    return logger;
  }
}

module.exports = Logger;
