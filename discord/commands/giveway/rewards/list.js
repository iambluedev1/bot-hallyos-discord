module.exports = {
  command: 'list',
  description: 'Lister les récompenses du giveway',
  usage: 'giveway (:word|<nom>) rewards list',
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

    const rewards = await db('hallyos_giveways_rewards').where({
      giveway_id: retrieved[0].id,
    });

    hallyos.discord.client.sendInfo(
      'Liste des récompences',
      `Voici la liste des récompences pour ce concours : 
      
      ${_.map(rewards, (r) => {
        return `x${r.quantity} ${r.name} (id: ${r.id})`;
      }).join('\n')}
      `,
      channel
    );
    message.delete();
  },
};
