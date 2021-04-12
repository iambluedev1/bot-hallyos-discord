module.exports = {
  command: 'add',
  description: 'Ajouter une récompense au giveway',
  usage: 'giveway (:word|<nom>) rewards add (:num|<quantité>) (:all|<reward>)',
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
        'Vous ne pouvez pas modifier un concours qui est lancé !',
        channel
      );
      message.delete();
      return;
    }

    const quantity = args[1];
    const name = args[2];

    await db('hallyos_giveways_rewards').insert({
      giveway_id: retrieved[0].id,
      quantity,
      name,
    });

    hallyos.discord.client.sendSuccess(
      'Récompense ajoutée',
      'La récompense à bien été ajouté !',
      channel
    );
    hallyos.helpers.record.discordAction(
      member,
      'GIVEWAY_ADD_REWARD',
      retrieved[0].id
    );
    hallyos.log.info('Successfully added reward to giveway ' + retrieved[0].id);
  },
};
