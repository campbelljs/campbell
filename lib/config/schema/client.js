module.exports = {
  disable: {
    doc: "Disable the client",
    format: Boolean,
    default: false
  },
  debug: {
    doc: "Client's debug mode",
    format: Boolean,
    default: false
  },
  configureNuxt: {
    doc:
      "[advanced] a function that takes default nuxt's config and returns the one you want to use",
    format: "function",
    default: nuxtConfig => nuxtConfig
  }
};
