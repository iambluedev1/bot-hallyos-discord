module.exports = {
  command: 'type',
  description: "Commencer la création d'un giveway",
  usage: 'giveway (:word|<name>) set type (:enum|<ALL_SERVER or REACTION>)',
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

    if (args[1] != 'ALL_SERVER' && args[1] != 'REACTION') {
      hallyos.discord.client.sendError(
        'Oups',
        "Le type n'est pas correcte, les seules valeurs possibles sont ALL_SERVER et REACTION",
        channel
      );
      return;
    }

    await db('hallyos_giveways')
      .update({ type: args[1] })
      .where({ name: args[0] });

    hallyos.discord.client.sendSuccess(
      'Type mis à jour',
      'Le type a bien été définit sur ' + args[1],
      channel
    );

    hallyos.helpers.record.discordAction(
      member,
      'GIVEWAY_SET_TYPE',
      retrieved[0].id
    );
  },
};
