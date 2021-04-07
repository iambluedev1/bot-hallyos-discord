module.exports = {
  listen: 'message',
  run: (message) => {
    if (message.toString().startsWith(hallyos.config.discord.prefix)) {
      hallyos.discord.client.emit('command', message);
    }
  },
};
