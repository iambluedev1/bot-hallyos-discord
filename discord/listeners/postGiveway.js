const moment = require('moment');

module.exports = {
  listen: 'postGiveway',
  run: async (giveway, member, channel, isPreview) => {
    const rewards = await db('hallyos_giveways_rewards')
      .where({
        giveway_id: giveway.id,
      })
      .orderBy('quantity', 'desc');

    const nbRewards = _.reduce(rewards, (prev, cur) => prev + cur.quantity, 0);

    let preview = `${giveway.description ? giveway.description + '\n' : ''}
 Au menu, ${
   nbRewards == 1
     ? '1 récompense est à gagner'
     : nbRewards + ' récompenses sont à gagner !'
 } 
 ${_.map(rewards, (r) => {
   return `x${r.quantity} **${r.name}**`;
 }).join('\n')}

 ${
   giveway.type == 'REACTION'
     ? `Pour participer rien de plus simple ! Vous avez juste a cliquer sur l'icône ${hallyos.config.discord.giveways.reaction.emoji} en réaction à ce message.`
     : "Vous n'avez rien à faire, tous les membres du serveurs sont sur la liste des participants !"
 }

 Ce concours durera **${moment(giveway.end_set_at).diff(
   moment(),
   'days'
 )}** jours. Il prendra fin le **${moment(giveway.end_set_at)
      .locale('fr')
      .format('D MMMM YYYY à HH:mm')}**

    A vous de jouer ! Bonne chance !

    @here
 `;

    if (isPreview) {
      const m = await hallyos.discord.client.sendSuccess(
        `**CONCOURS**`,
        preview,
        channel
      );
      const roles = (JSON.parse(giveway.excluded_roles) || []).map(
        (r) => r.name
      );
      hallyos.discord.client.sendInfo(
        `Liste des rôles exclus`,
        roles.length > 0
          ? roles.join(', ')
          : "Aucun rôle n'est exclu du giveway",
        channel
      );
      m.react(hallyos.config.discord.giveways.reaction.emoji);
    } else {
      const channelGiveway = hallyos.discord.client.channels.cache.get(
        hallyos.config.discord.giveways.channelId
      );
      const m = await hallyos.discord.client.sendSuccess(
        `**CONCOURS**`,
        preview,
        channelGiveway
      );
      m.react(hallyos.config.discord.giveways.reaction.emoji);
      hallyos.helpers.record.discordAction(
        member,
        'GIVEWAY_POSTED',
        JSON.stringify(giveway)
      );
      await db('hallyos_giveways')
        .update({ discord_message_id: m.id, scheduled: true })
        .where({ id: giveway.id });
    }
  },
};
