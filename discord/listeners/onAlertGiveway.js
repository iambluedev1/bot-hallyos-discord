const moment = require('moment');

module.exports = {
  listen: 'alertGiveway',
  run: async (args) => {
    const channelGiveway = hallyos.discord.client.channels.cache.get(
      hallyos.config.discord.giveways.channelId
    );

    const giveway = args.giveway;
    const type = args.type;

    const rewards = await db('hallyos_giveways_rewards')
      .where({
        giveway_id: giveway.id,
      })
      .orderBy('quantity', 'desc');

    const rewardsFormatted = _.map(rewards, (r) => {
      return `x${r.quantity} **${r.name}**`;
    }).join('\n');

    if (type == 'END_IN_ONE_WEEK') {
      const date = moment(giveway.end_set_at)
        .locale('fr')
        .format('D MMMM YYYY à HH:mm');
      hallyos.discord.client.sendSuccess(
        "Plus qu'une semaine !",
        `
      @here

      Le concours pour gagner : 
      ${rewardsFormatted}
      se terminera dans moins d'une semaine, le **${date}**
      `,
        channelGiveway
      );
    } else if (type == 'END_IN_ONE_DAY') {
      const date = moment(giveway.end_set_at).locale('fr').format('HH:mm');
      hallyos.discord.client.sendSuccess(
        "Plus qu'un jour !",
        `
          @here
    
          Le concours pour gagner : 
          ${rewardsFormatted}
          se terminera dans moins d'un jour, demain à **${date}**
          `,
        channelGiveway
      );
    } else if (type == 'END_IN_ONE_HOUR') {
      const date = moment(giveway.end_set_at).locale('fr').format('HH:mm');
      hallyos.discord.client.sendSuccess(
        "C'est bientôt la fin !",
        `
      @here

      Le concours pour gagner : 
      ${rewardsFormatted}
      se terminera dans moins d'une heure, à **${date}**
      `,
        channelGiveway
      );
    }
  },
};
