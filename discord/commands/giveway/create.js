module.exports = {
  command: 'create',
  description: "Commencer la création d'un giveway",
  usage: 'giveway create (:word|<nom>)',
  roles: hallyos.config.discord.giveways.roles,
  execute: async (args, channel, member, message) => {
    const retrieved = await db('hallyos_giveways')
      .where({ name: args[0] })
      .select();

    if (retrieved.length > 0) {
      hallyos.discord.client.sendError(
        'Oups',
        'Un giveway existe déjà avec ce nom !',
        channel
      );
      return;
    }
    hallyos.discord.client.sendInfo(
      '**Créer un giveway**',
      `Vous avez commencé la création d'un giveway. 
      Voici les commandes de configurations :
      
        -giveway ${args[0]} set type <ALL_SERVER|REACTION> : définir le mode de participation
        -giveway ${args[0]} set description <description> : définir la description du concours
        
        -giveway ${args[0]} rewards add <quantity> <reward> : ajouter une récompense
        -giveway ${args[0]} rewards list : voir la liste des récompences
        -giveway ${args[0]} rewards remove <reward> : retirer une récompense

        -giveway ${args[0]} excludes add <role> : exclure un rôle
        -giveway ${args[0]} excludes list : voir la liste des rôles exclus
        -giveway ${args[0]} excludes remove <role> : retirer un rôle de l'exclusion

        -giveway ${args[0]} schedule <date au format YYYY-MM-DD> <heure au format HH:MM> : définir la date de fin
        
        -giveway ${args[0]} preview : prévisualisation du concours
        -giveway ${args[0]} start : lancer le concours`,
      channel
    );
    hallyos.helpers.record.discordAction(member, 'GIVEWAY_CREATE');
    await db('hallyos_giveways').insert({
      name: args[0],
      type: 'ALL_SERVER',
    });
  },
};
