const { TextChannel } = require('discord.js');
const moment = require('moment');

module.exports = {
  listen: 'messageReactionRemove',
  run: async (reaction, user) => {
    if (
      hallyos.discord.client.user &&
      user.id != hallyos.discord.client.user.id &&
      reaction.message.member &&
      reaction.message.channel instanceof TextChannel
    ) {
      const giveways = await db('hallyos_giveways').where({
        discord_message_id: reaction.message.id,
      });

      if (giveways.length > 0) {
        const giveway = giveways[0];

        if (moment(giveway.end_set_at).isAfter(moment())) {
          await db('hallyos_giveways_participants')
            .where({
              giveway_id: giveway.id,
              discord_author_id: user.id,
            })
            .del();

          hallyos.helpers.record.discordAction(
            user,
            'GIVEWAY_REMOVE_PARTICIPATION',
            JSON.stringify({ giveway, user, reaction })
          );

          hallyos.discord.client.sendSuccess(
            'Désinscription enregistrée',
            `Hey !
    
              Nous avons bien pris en compte ta desinscription au concours du ${moment(
                giveway.end_set_at
              )
                .locale('fr')
                .format('D MMMM YYYY à HH:mm')} !
              
              Modification prise en compte le ${moment()
                .locale('fr')
                .format('D MMMM YYYY à HH:mm')}
              `,
            user
          );

          hallyos.log.info(
            `${user.username} successfully unsubscribed to the giveway ${giveway.id}`
          );
        } else {
          reaction.users.add(user);
        }
      }
    }
  },
};
