const { SyncHook } = require("tapable");
const { Nuxt, Builder } = require("nuxt");
const configureNuxt = require("./configure-nuxt.js");

let express = require("express");

class Ui {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    instance.registerHooks(require("./hooks"));

    instance.hooks["ui:configure-nuxt"].tap(
      "config.ui.configureNuxt",
      this.config.get("ui.configureNuxt").bind(instance)
    );

    instance.hooks["init"].tap("Ui", this.init.bind(this));
    instance.hooks["start"].tap("Ui", this.start.bind(this));
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
    this.#instance.hooks["ui:first-build:done"].call();
  }
  get config() {
    return this.#instance.config;
  }
  get render() {
    // returns the nuxt render middleware
    return this.nuxt.render;
  }
  static create(instance) {
    return new Ui(instance);
  }
}

module.exports = Ui;
