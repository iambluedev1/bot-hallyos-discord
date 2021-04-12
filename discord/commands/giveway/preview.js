module.exports = {
  command: 'preview',
  description: 'Prévisualisation du concours',
  usage: 'giveway (:word|<name>) preview',
  roles: hallyos.config.discord.giveways.roles,
  execute: async (args, channel, member, message) => {
    const retrieved = await db('hallyos_giveways')
      .where({ name: args[0] })
      .select();

    if (retrieved.length == 0) {
      hallyos.discord.client.sendError(
        'Oups',
        'Aucun giveway ne porte ce nom !',
        channel
      );
      message.delete();
      return;
    }

    const giveway = retrieved[0];
    hallyos.discord.client.emit('postGiveway', giveway, member, channel, true);
    message.delete();
  },
};
