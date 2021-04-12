module.exports = {
  command: 'add',
  description: 'Ajouter un utilisateur au ticket',
  usage: "ticket user add (:tag|<nom d'utilisateur>)",
  roles: hallyos.config.discord.support.roles,
  execute: async (args, channel, cmder, message) => {
    let ticket = await db('hallyos_tickets').where({
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
    }

    ticket = ticket[0];

    const guild = hallyos.discord.client.guilds.resolve(
      hallyos.config.discord.guildId
    );
    let find = false;
    guild.members.cache.array().forEach((member) => {
      if (
        args[0] == member.user.username ||
        args[0] == member.user.username + '#' + member.user.discriminator
      ) {
        find = true;

        db('hallyos_tickets_externals')
          .insert({
            ticket_id: ticket.id,
            discord_id: member.id,
            username: member.user.username,
            discord_added_by: cmder.user.username,
          })
          .then(() => {
            channel
              .updateOverwrite(member, {
                ADD_REACTIONS: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: true,
                EMBED_LINKS: true,
                VIEW_CHANNEL: true,
              })
              .then(async () => {
                hallyos.helpers.record.discordAction(
                  cmder,
                  'ADD_USER_TO_TICKET',
                  args[0] + ';' + ticket.id
                );
                hallyos.discord.client.sendInfo(
                  `Nouveau participant`,
                  `${cmder} vient d'ajouter ${member} au ticket`,
                  channel
                );
                hallyos.log.info(
                  `Successfully added ${member.user.username} to ticket ` +
                    ticket.id
                );
              });
          })
          .catch(async (e) => {
            hallyos.log.warn(e);
            const m = await hallyos.discord.client.sendError(
              'Erreur',
              `L'utilisateur ${member.user.username} a déjà été ajouté au ticket !`,
              channel
            );
            setTimeout(() => {
              m.delete();
            }, 5000);
          });
        return;
      }
    });

    message.delete();

    if (!find) {
      const message = await hallyos.discord.client.sendWarn(
        'Utilisateur introuvable',
        'Cette utilisateur est introuvable !',
        channel
      );
      setTimeout(() => {
        message.delete();
      }, 5000);
    }
  },
};
