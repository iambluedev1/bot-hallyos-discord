module.exports = {
  command: 'remove',
  description: 'Ne plus exclure un role du giveway',
  usage: 'giveway (:word|<nom>) excludes remove (:word|<rôle>)',
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

    const roles = JSON.parse(retrieved[0].excluded_roles) || [];
    const role = args[1];

    if (!roles.map((r) => r.name).includes(role)) {
      hallyos.discord.client.sendError(
        'Oups',
        "Ce rôle n'est pas exclue",
        channel
      );
      return;
    }

    await db('hallyos_giveways')
      .update({
        excluded_roles: JSON.stringify(_.remove(roles, (r) => r.name != role)),
      })
      .where({ id: retrieved[0].id });

    hallyos.discord.client.sendSuccess(
      'Role supprimée',
      'Le rôle a bien été retiré à la liste !',
      channel
    );
    hallyos.helpers.record.discordAction(
      member,
      'GIVEWAY_REMOVE_EXCLUDES',
      retrieved[0].id
    );
    hallyos.log.info(
      'Successfully removed exclusion to giveway ' + retrieved[0].id
    );
  },
};
