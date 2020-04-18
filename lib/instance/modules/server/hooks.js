const { SyncHook } = require("tapable");
module.exports = {
  "server:listen": new SyncHook()
};
