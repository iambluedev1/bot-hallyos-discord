const { TextChannel } = require('discord.js');
const moment = require('moment');

module.exports = {
  listen: 'messageReactionAdd',
  run: async (reaction, user) => {
    if (
      hallyos.discord.client.user &&
      hallyos.discord.reactMessage &&
      reaction.message.id == hallyos.discord.reactMessage.id &&
      user.id != hallyos.discord.client.user.id &&
      reaction.message.member &&
      reaction.message.channel instanceof TextChannel
    ) {
      const hasActiveTicket = !!(await db('hallyos_tickets')
        .select()
        .where('discord_id', user.id)
        .where('state', '!=', 0)
        .first());

      if (hasActiveTicket) {
        const message = await hallyos.discord.client.sendError(
          'Oups ❌',
          "Vous avez déjà un ticket d'ouvert ! Vous ne pouvez donc pas en ouvrir un nouveau\n\nBien cordialement, \nl'équipe d'Hallyos",
          user
        );
      } else {
        await db('hallyos_tickets').insert({
          discord_id: user.id,
          channel_id: 'qdqd',
          author: user.username,
        });
        console.log('creating ticket');
        hallyos.discord.client.emit('createTicket', user);
      }

      reaction.users.remove(user);
    } else if (
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
          await db('hallyos_giveways_participants').insert({
            giveway_id: giveway.id,
            discord_author_id: user.id,
            discord_author_username: user.username,
          });
          hallyos.discord.client.sendSuccess(
            'Participation enregistrée',
            `Hey !

          Nous avons bien pris en compte ta participation pour le concours du ${moment(
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

          hallyos.helpers.record.discordAction(
            user,
            'GIVEWAY_ADD_PARTICIPATION',
            JSON.stringify({ giveway, user, reaction })
          );

          hallyos.log.info(
            `${user.username} successfully subscribed to the giveway ${giveway.id}`
          );
        } else {
          reaction.users.remove(user);
        }
      }
    }
  },
};
