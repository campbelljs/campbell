module.exports = {
  disable: {
    doc: "Disable the serve",
    format: Boolean,
    default: false
  },
  ssl: {
    enabled: {
      doc: "Use ssl",
      default: false
    }
  },
  host: {
    doc: "Hostname",
    default: "localhost"
  },
  port: {
    doc: "Port",
    default: 9293,
    env: "PORT",
    arg: "port"
  }
};
