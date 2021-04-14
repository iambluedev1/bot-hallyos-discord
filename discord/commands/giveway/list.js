const moment = require('moment');

module.exports = {
  command: 'list',
  description: 'Liste des giveways',
  usage: 'giveway list',
  roles: hallyos.config.discord.giveways.roles,
  execute: async (args, channel, member, message) => {
    const giveways = await db('hallyos_giveways').select();

    hallyos.discord.client.sendInfo(
      'Liste des concours',
      _.map(giveways, (g) => {
        return `nom: **${g.name}**
        état: ${
          g.scheduled
            ? 'en cours'
            : g.last_alert == 'ENDED'
            ? 'terminé'
            : 'non-programmé'
        } 
        ajouté le : ${moment(g.created_at)
          .locale('fr')
          .format('D MMMM YYYY à HH:mm')}`;
      }).join('\n\n') || 'Aucun concours de crée',
      channel
    );

    message.delete();
  },
};
