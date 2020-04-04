const path = require("path");
const _ = require("lodash");
const webpack = require("webpack");

module.exports = function() {
  let $app = this;

  let config = this.config;
  let dev = this.isDev;

  let buildDir = this.getDir("build");

  let SERVER_URL = this.server.url;

  let nuxtConfig = {
    dev,
    buildDir: path.join(buildDir, ".client"),
    vue: {
      config: {
        productionTip: false
      }
    },
    rootDir: $app.getDir("root"),
    dir: {
      pages: $app.getDir("public", true)
    },
    ignore: [
      "**/*.js",
      `${$app.getDir("public", true)}/**/components/**`,
      `${$app.getDir("public", true)}/components/**`
    ],
    // // vuetify
    // buildModules: ["@nuxtjs/vuetify"],
    // vuetify: {
    //   optionsPath: "./vuetify.options.js",
    //   defaultAssets: false
    // },
    build: {
      quiet: config.get("client.quiet"),
      plugins: [
        new webpack.DefinePlugin({
          "process.env.SERVER_URL": JSON.stringify(SERVER_URL)
        })
      ]
    }
  };

  // apply configureNuxt
  nuxtConfig = config.client.configureNuxt(nuxtConfig);

  return nuxtConfig;
};
