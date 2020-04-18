const { SyncHook } = require("tapable");
module.exports = {
  "ui:configure-nuxt": new SyncHook(["nuxtConfig"]),
  "ui:first-build:done": new SyncHook()
};
