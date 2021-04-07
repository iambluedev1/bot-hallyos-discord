const knex = require('knex')({
  client: 'mysql',
  connection: hallyos.config.knex.auth,
  log: {
    warn(message) {
      hallyos.log.warn(message);
    },
    error(message) {
      hallyos.log.error(message);
    },
    deprecate(message) {
      hallyos.log.warn(message);
    },
    debug(message) {
      hallyos.log.debug(message);
    },
  },
});

module.exports = knex;
