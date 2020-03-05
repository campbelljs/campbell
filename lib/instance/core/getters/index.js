module.exports = {
  name() {
    return this.config.get("name");
  },
  noServer() {
    return this.config.get("server.disable");
  },
  noClient() {
    return this.config.get("client.disable");
  }
};
