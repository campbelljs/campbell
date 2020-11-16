const Instance = require("./index.js");
const _set = require("lodash/set");

class WorkerInstance extends Instance {
  constructor(config, debug = false) {
    debug
      ? _set(config, "env", "development")
      : _set(config, "env", "production");
    _set(config, "server.disable", true);
    super(config);
  }
  isWorker = {
    get() {
      return true;
    }
  };
}

module.exports = WorkerInstance;
