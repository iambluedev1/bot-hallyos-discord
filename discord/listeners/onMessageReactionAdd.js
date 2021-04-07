const { TextChannel } = require('discord.js');

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
    }
  },
};
