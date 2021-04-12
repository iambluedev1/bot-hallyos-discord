module.exports = {
  command: 'close',
  description: 'Fermer un ticket',
  usage: 'ticket close',
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
      if (ticket[0].state == 0) {
        const m = await hallyos.discord.client.sendWarn(
          'Oups 😅',
          'Ce ticket est déjà fermé',
          channel,
          'action par ' + message.author.username
        );
        setTimeout(() => {
          m.delete();
          message.delete();
        }, 5000);
        return;
      }

      const messages = await channel.messages.fetch();
      channel.delete();
      await db('hallyos_tickets')
        .update({ state: 0 })
        .where({ channel_id: channel.id });
      hallyos.log.info('Ticket #' + ticket[0].id + ' successfully closed');
      hallyos.log.info('Ticket #' + ticket[0].id + ' saving messages');
      messages.forEach(async (message) => {
        if (!message.author.bot) {
          await db('hallyos_tickets_messages').insert({
            discord_author_id: message.author.id,
            discord_message_id: message.id,
            author: message.author.username,
            ticket_id: ticket[0].id,
            content: message.toString(),
            created_at: message.createdAt,
          });
        }
      });
      hallyos.log.info('Ticket #' + ticket[0].id + ' messages saved');
    }
  },
};
