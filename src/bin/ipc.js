const ipc = require('node-ipc');
const { spawn } = require('child_process');

module.exports = () => {
  ipc.config.id = 'hallyosbot';
  ipc.config.retry = 1500;
  ipc.config.logger = hallyos.log.debug;

  if (hallyos.config.runJob) {
    ipc.connectTo(ipc.config.id, () => {
      ipc.of[ipc.config.id].on('connect', () => {
        hallyos.log.info(
          `client successfully connected to ipc server ${
            ipc.config.socketRoot + ipc.config.appspace + ipc.config.id
          }`
        );
        hallyos.event.on('to-master', (event) => {
          ipc.of[ipc.config.id].emit('from-cron', event);
        });
      });
      ipc.of[ipc.config.id].on('disconnect', () => {
        hallyos.log.info(
          `Disconnected from ${
            ipc.config.socketRoot + ipc.config.appspace + ipc.config.id
          }`
        );
        hallyos.log.error('Master process is down, shutdown too !');
        process.exit(-1);
      });
    });
  } else {
    ipc.config.unlink = true;
    ipc.serve(() => {
      ipc.server.on('from-cron', (data) => {
        hallyos.event.emit(data.event, data.args || null);
      });

      const cronProcess = spawn('node', ['server.js', '-c', 'true']);
      hallyos.log.info('Started cron process with pid ' + cronProcess.pid);

      cronProcess.on('close', (code) => {
        hallyos.log.error(`Cron process exited with code ${code}`);
      });

      const redirectLogs = (data) => {
        data = data.toString().trim();
        if (data.startsWith('debug:')) {
          hallyos.log.debug('[CRON]' + data.replace('debug:', ''));
        }

        if (data.startsWith('info:')) {
          hallyos.log.debug('[CRON]' + data.replace('info:', ''));
        }

        if (data.startsWith('warn:')) {
          hallyos.log.debug('[CRON]' + data.replace('warn:', ''));
        }

        if (data.startsWith('error:')) {
          hallyos.log.error('[CRON]' + data.replace('error:', ''));
        }
      };

      cronProcess.stdout.on('data', redirectLogs);
      cronProcess.stderr.on('data', redirectLogs);
    });

    ipc.server.start();
    hallyos.log.info(
      `pid ${process.pid} listening on ${
        ipc.config.socketRoot + ipc.config.appspace + ipc.config.id
      }`
    );
  }
};
