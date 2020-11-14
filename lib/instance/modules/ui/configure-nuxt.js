const path = require("path");
const _ = require("lodash");
const webpack = require("webpack");

module.exports = function() {
  let $instance = this;

  let config = $instance.config;
  let isDev = $instance.isDev;

  let buildDir = this.getDir("build");

  let SERVER_URL = this.server.url;

  let nuxtConfig = {
    telemetry: false,
    dev: isDev,
    buildDir: path.join(buildDir, "ui"),
    vue: {
      config: {
        productionTip: false
      }
    },
    rootDir: $instance.getDir("root"),
    dir: {
      pages: $instance.getDir("public", true)
    },
    ignore: [
      "**/*.js",
      `${$instance.getDir("public", true)}/**/components/**`,
      `${$instance.getDir("public", true)}/components/**`
    ],
    build: {
      quiet: !isDev,
      plugins: [
        new webpack.DefinePlugin({
          "process.env.SERVER_URL": JSON.stringify(SERVER_URL)
        })
      ]
    },
    head: {
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1"
        }
      ]
    }
  };

  $instance.hooks["ui:configure-nuxt"].call(nuxtConfig);

  return nuxtConfig;
};
