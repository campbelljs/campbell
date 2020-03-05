module.exports = {
  disable: {
    doc: "Disable the client",
    format: "boolean",
    default: false
  },
  debug: {
    doc: "Client's debug mode",
    format: "boolean",
    default: false
  },
  configureNuxt: {
    doc:
      "[advanced] a function that takes default nuxt's config and returns the one you want to use",
    format: "function",
    default: nuxtConfig => nuxtConfig
  }
};
