module.exports = {
  command: 'unlock',
  description: 'Dévérouiller un ticket',
  usage: 'ticket manage unlock',
  param: 0,
  execute: async (args, channel, member, message) => {
    const ticket = await db('hallyos_tickets').where({
      channel_id: channel.id,
    });

    if (!ticket) {
      const m = await hallyos.discord.client.sendError(
        'Erreur',
        'Vous ne pouvez éxecuter cette commande que depuis un ticket !',
        channel
      );
      setTimeout(() => {
        m.delete();
        message.delete();
      }, 5000);
      return;
    } else {
      if (ticket[0].state == 1) {
        const m = await hallyos.discord.client.sendWarn(
          'Oups 😅',
          "Ce ticket n'est pas vérouillé",
          channel,
          'action par ' + message.author.username
        );
        setTimeout(() => {
          m.delete();
          message.delete();
        }, 5000);
        return;
      }
      const user = await message.guild.members.fetch(ticket[0].discord_id);
      channel
        .updateOverwrite(
          user,
          { SEND_MESSAGES: true },
          'Le ticket a été dévérouillé par ' + message.author.username
        )
        .then(async () => {
          hallyos.helpers.record.discordAction(
            member,
            'UNLOCK_TICKET',
            JSON.stringify(ticket[0])
          );
          hallyos.discord.client.sendSuccess(
            'Ticket dévérrouillé',
            `Le ticket a bien été dévérouillé ! ${user}, tu peux désormais répondre au ticket.`,
            channel,
            'action par ' + message.author.username
          );
          hallyos.log.info(
            'Ticket ' + ticket[0].id + ' unlocked by ' + member.user.tag
          );

          setTimeout(() => {
            message.delete();
          }, 5000);

          await db('hallyos_tickets')
            .update({ state: 1 })
            .where({ id: ticket[0].id });
        })
        .catch((e) => {
          hallyos.log.error(e);
          hallyos.discord.client.sendError(
            'Oups 😅',
            "Une erreur est survenue durant la tentative de dévérouillage du ticket. Notre équipe vient d'être mise au courant. Désolé.",
            channel,
            'action par ' + message.author.username
          );

          setTimeout(() => {
            message.delete();
          }, 5000);
        });
    }
  },
};
