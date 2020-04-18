module.exports = {
  disable: {
    doc: "Disable the ui",
    format: "boolean",
    default: false
  },
  debug: {
    doc: "Ui's debug mode",
    format: "boolean",
    default: false
  },
  configureNuxt: {
    doc:
      "[advanced] a function that takes default nuxt's config and tweaks it in place",
    format: "function",
    default: nuxtConfig => {}
  }
};
