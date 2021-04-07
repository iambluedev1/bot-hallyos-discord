module.exports = {
  listen: 'ready',
  run: async () => {
    hallyos.discord.client.emit('refreshStatus');

    const channelHelp = hallyos.discord.client.channels.cache.get(
      hallyos.config.discord.support.channelId
    );

    const messages = await channelHelp.messages.fetch();
    if (messages.size > 0) await channelHelp.bulkDelete(messages.size);

    const message = await hallyos.discord.client.sendInfo(
      "Demande d'assistance ❓",
      'Un problème ou un simple question ? Cliquez sur la réaction pour ouvrir un ticket support, notre équipe technique est disponible 24/24h et 7J/7 !',
      channelHelp
    );
    message.react(hallyos.config.discord.support.reactionEmoji);
    hallyos.discord.reactMessage = message;
  },
};
