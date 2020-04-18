const { SyncHook } = require("tapable");
module.exports = {
  "client:configure-nuxt": new SyncHook(["nuxtConfig"]),
  "client:first-build:done": new SyncHook()
};
