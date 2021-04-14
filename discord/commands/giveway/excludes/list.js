module.exports = {
  command: 'list',
  description: 'Lister les rôles exclus du giveway',
  usage: 'giveway (:word|<nom>) excludes list',
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
    const roles = (JSON.parse(retrieved[0].excluded_roles) || []).map(
      (r) => r.name
    );
    hallyos.discord.client.sendSuccess(
      'Liste des rôles exclues',
      roles.length > 0 ? roles.join(', ') : "Aucun rôle n'est exclu du giveway",
      channel
    );

    message.delete();
  },
};
