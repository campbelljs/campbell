module.exports = {
  disable: {
    doc: "Disable the serve",
    format: "boolean",
    default: false
  },
  ssl: {
    enabled: {
      doc: "Use ssl",
      format: "boolean",
      default: false
    }
  },
  host: {
    doc: "Hostname",
    default: "localhost"
  },
  port: {
    doc: "Port",
    format: "number",
    default: 9293,
    env: "PORT",
    arg: "port"
  }
};
