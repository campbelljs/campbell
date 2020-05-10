const { SyncHook, AsyncSeriesHook, AsyncParallelHook } = require("tapable");

module.exports = {
  // init
  init: new AsyncParallelHook(),
  // build
  "build:before": new AsyncParallelHook(),
  build: new AsyncParallelHook(),
  "build:after": new AsyncParallelHook(),
  // start
  "start:before": new AsyncParallelHook(),
  start: new SyncHook(),
  // stop
  "stop:before": new AsyncParallelHook(),
  stop: new SyncHook()
};
