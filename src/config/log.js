module.exports.log = {
  level: "debug",
  file: "app.log",
  timestamp: {
    format: "DD-MM-YY HH:mm:ss",
  },
  metadata: {
    fillExcept: ["message", "level", "timestamp", "label"],
  },
  email: {
    to: "dev@hallyos.com",
    logLinesCount: 100,
    wait: 10,
  },
};
