module.exports = {
  command: 'start',
  description: 'Lancer un giveway',
  usage: 'giveway (:word|<nom>) start',
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

    if (retrieved[0].scheduled) {
      hallyos.discord.client.sendError(
        'Oups',
        'Vous ne pouvez pas lancer ce concours car il est déjà lancé',
        channel
      );
      message.delete();
      return;
    }

    const rewards = await db('hallyos_giveways_rewards').where({
      giveway_id: retrieved[0].id,
    });

    if (retrieved[0].end_set_at == null || retrieved[0].end_set_at == '') {
      hallyos.discord.client.sendError(
        'Oups',
        'Vous devez spécifier une date de fin',
        channel
      );
      message.delete();
      return;
    }

    if (rewards.length == 0) {
      hallyos.discord.client.sendError(
        'Oups',
        'Vous devez ajouter au moins une récompense !',
        channel
      );
      message.delete();
      return;
    }

    hallyos.discord.client.emit(
      'postGiveway',
      retrieved[0],
      member,
      channel,
      false
    );
  },
};
