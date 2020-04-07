module.exports = function() {
  // register client's handlers
  this.$on("client.nuxt.configure", this.config.get("client.configureNuxt"));
};
