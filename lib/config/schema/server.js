module.exports = {
  disable: {
    doc: "Disable the serve",
    format: "boolean",
    default: false,
    env: "CAMPBELL_SERVER_DISABLE"
  },
  ssl: {
    enabled: {
      doc: "Use ssl",
      format: "boolean",
      default: false,
      env: ["CAMPBELL_APP_SSL", "SSL"]
    }
  },
  host: {
    doc: "Hostname",
    default: "localhost",
    env: "CAMPBELL_SERVER_HOST"
  },
  port: {
    doc: "Port",
    format: "number",
    default: 9293,
    env: ["CAMPBELL_SERVER_PORT", "PORT"],
    arg: "port"
  }
};
