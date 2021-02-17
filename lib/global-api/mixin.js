const { mergeOptions } = require("../utils");

module.exports = function (Campbell) {
  Campbell.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin, null, this);
    return this;
  };

  // Campbell.mixins = {};
  // Campbell.addMixin = function (collection, opts) {
  //   if (typeof collection !== "string") {
  //     throw new TypeError(`Please provide a mixin collection name as a string`);
  //   }
  //   if (!(collection in Campbell.mixins)) {
  //     Campbell.mixins[collection] = [];
  //   }
  //   Campbell.mixins[collection].push(opts);
  // };
  // Campbell.getMixins = function (collection) {
  //   return Campbell.mixins[collection] || [];
  // };
};
