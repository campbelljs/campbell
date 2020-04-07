const { Nuxt, Builder } = require("nuxt");
const configureNuxt = require("./configure-nuxt.js");

let express = require("express");

class Client {
  #app;
  constructor(app) {
    this.#app = app;
  }
  init() {
    this.nuxt = new Nuxt(configureNuxt.call(this.#app));
    this.builder = new Builder(this.nuxt);
  }
  start() {
    this.build();
  }
  async build() {
    await this.builder.build();
  }
  get config() {
    return this.#app.config;
  }
  get render() {
    // returns the nuxt render middleware
    return this.nuxt.render;
  }
  static create(app) {
    return new Client(app);
  }
}

module.exports = Client;
