module.exports = {
  disable: {
    doc: "Disable the ui",
    format: "boolean",
    default: false,
    env: "CAMPBELL_UI_DISABLE"
  },
  debug: {
    doc: "Ui's debug mode",
    format: "boolean",
    default: false,
    env: "CAMPBELL_UI_DEBUG"
  },
  configureNuxt: {
    doc:
      "[advanced] a function that takes default nuxt's config and tweaks it in place",
    format: "function",
    default: nuxtConfig => {}
  }
};
