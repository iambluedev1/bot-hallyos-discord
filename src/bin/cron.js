const fs = require('fs');
const cron = require('node-cron');

module.exports = () => {
  fs.readdirSync('./src/cron/').forEach((file) => {
    let job = require('../cron/' + file);
    cron.schedule(job.interval, async () => {
      if (job.taskRunning || !job.active) {
        return;
      }

      job.taskRunning = true;

      let start = Date.now();
      hallyos.log.debug('Executing job ' + file);
      let status = false;

      try {
        status = await job.onTick();
      } catch (e) {
        hallyos.log.error(e);
      }

      let end = Date.now();

      if (status) {
        hallyos.log.debug('Job executed in ' + (end - start) + 'ms');
      } else {
        hallyos.log.error('job ' + file + ' failed');
      }

      job.taskRunning = false;
      job.retry = 0;
    });

    hallyos.log.debug('Loaded Job ' + file);
  });
};
