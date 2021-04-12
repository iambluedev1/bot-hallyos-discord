module.exports = {
  command: 'remove',
  description: 'SUpprimer une récompense du giveway',
  usage: 'giveway (:word|<nom>) rewards remove (:id|<identifiant>)',
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

    db('hallyos_giveways_rewards')
      .where({ giveway_id: retrieved[0].id, id: args[1] })
      .del()
      .then((e) => {
        if (e == 1) {
          hallyos.discord.client.sendSuccess(
            'Récompense supprimée',
            'La récompense à bien été supprimé !',
            channel
          );
          hallyos.helpers.record.discordAction(
            member,
            'GIVEWAY_REMOVE_REWARD',
            retrieved[0].id
          );
          hallyos.log.info(
            'Successfully removed reward to giveway ' + retrieved[0].id
          );
        } else {
          hallyos.discord.client.sendError(
            'Oups',
            "La récompense n'existe pas",
            channel
          );
        }
      })
      .catch((e) => {
        hallyos.discord.client.sendError(
          'Oups',
          "La récompense n'existe pas",
          channel
        );
      });
  },
};
