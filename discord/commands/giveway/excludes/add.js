module.exports = {
  command: 'add',
  description: 'Exclure un rôle du giveway',
  usage: 'giveway (:word|<nom>) excludes add (:word|<rôle>)',
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

    if (roles.map((r) => r.name).includes(role)) {
      hallyos.discord.client.sendError(
        'Oups',
        'Ce rôle est déjà exclue',
        channel
      );
      return;
    }

    const guild = hallyos.discord.client.guilds.resolve(
      hallyos.config.discord.guildId
    );

    const guildRoles = guild.roles.cache.array();

    if (!guildRoles.map((r) => r.name).includes(role)) {
      hallyos.discord.client.sendError(
        'Oups',
        "Ce rôle n'existe pas sur le serveur",
        channel
      );
      return;
    }

    const guildRole = _.find(
      _.map(guildRoles, (r) => {
        return { id: r.id, name: r.name };
      }),
      (r) => r.name == role
    );

    roles.push(guildRole);
    await db('hallyos_giveways')
      .update({ excluded_roles: JSON.stringify(roles) })
      .where({ id: retrieved[0].id });

    hallyos.discord.client.sendSuccess(
      'Role ajouté',
      'Le rôle a bien été ajouté à la liste !',
      channel
    );
    hallyos.helpers.record.discordAction(
      member,
      'GIVEWAY_ADD_EXCLUDES',
      retrieved[0].id
    );
    hallyos.log.info(
      'Successfully added exclusion to giveway ' + retrieved[0].id
    );
  },
};
