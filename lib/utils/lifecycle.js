const LIFECYCLE_HOOKS = {
  beforeCreate: "Sync",
  created: "Sync",
  beforeMount: "Async",
  mounted: "Sync",
  beforeDestroy: "Async",
  destroyed: "Sync",
};

exports.LIFECYCLE_HOOKS = LIFECYCLE_HOOKS;
