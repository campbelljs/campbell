const { SyncHook } = require("tapable");

module.exports = {
  start: new SyncHook(),
  stop: new SyncHook()
};
