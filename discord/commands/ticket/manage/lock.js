module.exports = {
  command: 'lock',
  description: 'Vérouiller un ticket',
  usage: 'ticket manage lock',
  roles: hallyos.config.discord.support.roles,
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
      if (ticket[0].state == 2) {
        const m = await hallyos.discord.client.sendWarn(
          'Oups 😅',
          'Ce ticket est déjà vérouillé',
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
          { SEND_MESSAGES: false },
          'Le ticket a été vérouillé par ' + message.author.username
        )
        .then(async () => {
          hallyos.helpers.record.discordAction(
            member,
            'LOCK_TICKET',
            JSON.stringify(ticket[0])
          );
          hallyos.discord.client.sendSuccess(
            'Ticket vérrouillé',
            'Le ticket a bien été vérouillé ! Seul les membres de notre équipe pourront répondre.',
            channel,
            'action par ' + message.author.username
          );
          hallyos.log.info(
            'Ticket ' + ticket[0].id + ' locked by ' + member.user.tag
          );
          setTimeout(() => {
            message.delete();
          }, 5000);

          await db('hallyos_tickets')
            .update({ state: 2 })
            .where({ id: ticket[0].id });
        })
        .catch((e) => {
          hallyos.log.error(e);
          hallyos.discord.client.sendError(
            'Oups 😅',
            "Une erreur est survenue durant la tentative de vérouillage du ticket. Notre équipe vient d'être mise au courant. Désolé.",
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
