module.exports = {
  listen: 'createTicket',
  run: async (member) => {
    const guild = hallyos.discord.client.guilds.resolve(
      hallyos.config.discord.guildId
    );
    const categorySupport = hallyos.discord.client.channels.cache.get(
      hallyos.config.discord.support.categoryId
    );
    const retrieved = (
      await db('hallyos_tickets').where({
        discord_id: member.id,
        state: 1,
      })
    )[0];
    hallyos.helpers.record.discordAction(
      member,
      'CREATE_TICKET',
      JSON.stringify(retrieved)
    );
    const channel = await guild.channels.create(
      'ticket-' +
        member.username.toLocaleLowerCase() +
        '-' +
        retrieved.id.split('-')[0],
      {
        permissionOverwrites: [
          {
            id: member.id,
            allow: [
              'ADD_REACTIONS',
              'SEND_MESSAGES',
              'READ_MESSAGE_HISTORY',
              'ATTACH_FILES',
              'EMBED_LINKS',
              'VIEW_CHANNEL',
            ],
            deny: ['MENTION_EVERYONE'],
          },
          {
            id: guild.roles.everyone,
            deny: [
              'VIEW_CHANNEL',
              'SEND_MESSAGES',
              'ADD_REACTIONS',
              'READ_MESSAGE_HISTORY',
              'ATTACH_FILES',
              'USE_EXTERNAL_EMOJIS',
            ],
          },
        ],
        parent: categorySupport,
      }
    );

    await db('hallyos_tickets')
      .update({ channel_id: channel.id })
      .where({ discord_id: member.id, state: 1 });

    hallyos.discord.client.sendInfo(
      'Ticket',
      `Hey ${member} !

      Dis nous en quoi nous pouvons t'aider.
      Nous allons traiter ton ticket dans les meilleurs délais.
  
      Cordialement, 
      L'équipe d'Hallyos

      @here`,
      channel,
      'référence: ' + retrieved.id
    );

    hallyos.log.info(
      'Ticket ' + retrieved.id + ' created by ' + member.user.tag
    );
  },
};
