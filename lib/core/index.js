const { initMixin } = require("./init");
const { lifecycleMixin } = require("./lifecycle");
const { childMixin } = require("./child");

class Campbell {
  constructor(options) {
    this._init(options);
  }
}
Campbell.options = {};
Campbell.options._base = Campbell;
Campbell.prototype._isCampbell = true;

// global api
require("../global-api")(Campbell);

initMixin(Campbell);
lifecycleMixin(Campbell);
childMixin(Campbell);

module.exports = Campbell;
