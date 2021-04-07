const dotenv = require('dotenv');
const fs = require('fs');
const _ = require('lodash');
const fetch = require('node-fetch');
dotenv.config({ path: './.env' });
const validator = require('validator');

global['_'] = _;
global['fetch'] = fetch;
global['validator'] = validator;
global['hallyos'] = {
  config: {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
  },
  log: {},
  helpers: {},
  discord: {
    commands: {},
    client: null,
  },
};

fs.readdirSync('./src/config/').forEach((file) => {
  let config = require('./src/config/' + file);
  _.merge(global['hallyos']['config'], config);
});

require('./src/bin/logger')();
hallyos.log.debug('Running app in ' + hallyos.config.environment + ' mode');
require('./src/bin/helpers')();
require('./src/bin/handler');
global['db'] = require('./src/bin/datastore');
require('./src/bin/bootstrap')(db);
require('./src/bin/cron')();

const app = require('./src/app');
const port = hallyos.config.port || 3000;
const server = app.listen(port, () => {
  hallyos.log.info(`App running on port ${port}...`);
  require('./discord/client');
});
