module.exports = {
  interval: '*/30 * * * * *',
  active: true,
  onTick: async () => {
    hallyos.discord.client.emit('refreshStatus');
    return true;
  },
};
