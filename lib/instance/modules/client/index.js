const { SyncHook } = require("tapable");
const { Nuxt, Builder } = require("nuxt");
const configureNuxt = require("./configure-nuxt.js");

let express = require("express");

class Client {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    instance.registerHook(
      "client:configure-nuxt",
      new SyncHook(["nuxtConfig"])
    );
    instance.hooks["client:configure-nuxt"].tap(
      "config.client.configureNuxt",
      this.config.get("client.configureNuxt").bind(instance)
    );
  }
  init() {
    this.nuxt = new Nuxt(configureNuxt.call(this.#instance));
    this.builder = new Builder(this.nuxt);
  }
  start() {
    this.build();
  }
  async build() {
    await this.builder.build();
  }
  get config() {
    return this.#instance.config;
  }
  get render() {
    // returns the nuxt render middleware
    return this.nuxt.render;
  }
  static create(instance) {
    return new Client(instance);
  }
}

module.exports = Client;
