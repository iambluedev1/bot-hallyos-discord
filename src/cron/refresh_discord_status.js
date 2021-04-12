module.exports = {
  interval: '*/30 * * * * *',
  active: true,
  onTick: async () => {
    hallyos.event.emit('to-master', { event: 'refreshStatus' });
    return true;
  },
};
