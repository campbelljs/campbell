module.exports = {
  name() {
    return this.config.get("name");
  },
  env() {
    return this.config.get("env");
  },
  isDev() {
    return this.env === "development";
  },
  noServer() {
    return this.config.get("server.disable");
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
