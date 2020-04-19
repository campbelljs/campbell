const { SyncHook, AsyncSeriesHook } = require("tapable");

module.exports = {
  start: new SyncHook(),
  init: new AsyncSeriesHook(),
  stop: new SyncHook()
};
