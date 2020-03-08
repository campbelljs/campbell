module.exports = {
  name() {
    return this.config.get("name");
  },
  noServer() {
    return this.config.get("server.disable");
  },
  noClient() {
    return this.config.get("client.disable");
  },
  alias() {
    let $app = this;
    let core = Object.fromEntries(
      Object.keys(this.config.get("dir")).map(key => {
        return [`@${key}`, $app.getDir(key)];
      })
    );
    let custom = this.config.get("alias");
    return {
      ...core,
      ...custom
    };
  }
};