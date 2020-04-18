module.exports = {
  name() {
    return this.config.get("name");
  },
  isDev() {
    return this.config.get("dev");
  },
  noServer() {
    return this.config.get("server.disable");
  },
  noClient() {
    return this.config.get("client.disable");
  },
  alias() {
    let $instance = this;
    let core = Object.fromEntries(
      Object.keys(this.config.get("dir")).map(key => {
        return [`#${key}`, $instance.getDir(key)];
      })
    );
    let custom = this.config.get("alias");
    return {
      ...core,
      ...custom
    };
  }
};
