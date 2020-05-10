const { SyncHook, AsyncSeriesHook, AsyncParallelHook } = require("tapable");

module.exports = {
  init: new AsyncParallelHook(),
  "start:before": new AsyncParallelHook(),
  start: new SyncHook(),
  "stop:before": new AsyncParallelHook(),
  stop: new SyncHook()
};
