module.exports.log = {
  level: 'debug',
  file: 'app.log',
  timestamp: {
    format: 'DD-MM-YY HH:mm:ss',
  },
  metadata: {
    fillExcept: ['message', 'level', 'timestamp', 'label'],
  },
  email: {
    to: 'dev@properf.fr',
    logLinesCount: 100,
    wait: 10,
  },
};
