const yargs = require('yargs');
const dotenv = require('dotenv');
const fs = require('fs');
const _ = require('lodash');
const fetch = require('node-fetch');
dotenv.config({ path: './.env' });
const validator = require('validator');
const EventEmitter = require('events');

const argv = yargs
  .option('cron', {
    alias: 'c',
    description: 'Start Cron Process',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .demandOption(['cron'], 'Please provide cron argument')
  .showHelpOnFail(true).argv;

global['_'] = _;
global['fetch'] = fetch;
global['validator'] = validator;
global['hallyos'] = {
  config: {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    runJob: argv.cron,
  },
  log: {},
  helpers: {},
  event: new EventEmitter(),
  discord: {
    commands: [],
    client: null,
  },
};

fs.readdirSync('./src/config/').forEach((file) => {
  let config = require('./src/config/' + file);
  _.merge(global['hallyos']['config'], config);
});

require('./src/bin/logger')();
hallyos.log.debug(
  'Running app in ' +
    hallyos.config.environment +
    ' mode,' +
    (hallyos.config.runJob == true ? ' will run jobs' : ' will not run jobs')
);
require('./src/bin/helpers')();
require('./src/bin/handler');
global['db'] = require('./src/bin/datastore');
require('./src/bin/bootstrap')(db);
require('./src/bin/ipc')();

if (!(hallyos.config.runJob == true)) {
  const app = require('./src/app');
  const port = hallyos.config.port || 3000;
  const server = app.listen(port, () => {
    hallyos.log.info(`App running on port ${port}...`);
    require('./discord/client');
  });
} else {
  require('./src/bin/cron')();
}
