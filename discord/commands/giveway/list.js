const { schedule } = require('node-cron');

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
        return `${g.name} ${
          g.scheduled ? 'en cours' : 'non-programmé'
        } ajouté le : ${g.created_at}`;
      }).join('\n') || 'Aucun concours de crée',
      channel
    );

    message.delete();
  },
};
