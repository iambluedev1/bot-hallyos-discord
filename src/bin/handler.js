process.on('uncaughtException', (err) => {
  hallyos.log.error(err);
});

process.on('unhandledRejection', (err) => {
  hallyos.log.error(err);
});
