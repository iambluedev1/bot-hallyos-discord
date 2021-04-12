module.exports = {
  command: 'description',
  description: "Commencer la création d'un giveway",
  usage: 'giveway (:word|<name>) set description (:all|<description>)',
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

    await db('hallyos_giveways')
      .update({ description: args[1] })
      .where({ name: args[0] });

    hallyos.discord.client.sendSuccess(
      'Description mise à jour',
      'La description a bien été définit sur ' + args[1],
      channel
    );

    hallyos.helpers.record.discordAction(
      member,
      'GIVEWAY_SET_TYPE',
      retrieved[0].id
    );
  },
};
