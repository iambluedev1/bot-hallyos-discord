const ipc = require('node-ipc');

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
      });
    });
  } else {
    ipc.serve(() => {
      ipc.server.on('from-cron', (data) => {
        hallyos.event.emit(data.event, data.args || null);
      });
    });

    ipc.server.start();
    hallyos.log.info(
      `pid ${process.pid} listening on ${
        ipc.config.socketRoot + ipc.config.appspace + ipc.config.id
      }`
    );
  }
};
