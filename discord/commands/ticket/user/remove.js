module.exports = {
  command: "remove",
  description: "Retirer un utilisateur du ticket",
  usage: "ticket user remove (:tag|<nom d'utilisateur>)",
  roles: hallyos.config.discord.support.roles,
  execute: async (args, channel, cmder, message) => {
    let ticket = await db("hallyos_tickets").where({
      channel_id: channel.id,
    });

    if (!ticket) {
      const m = await hallyos.discord.client.sendError(
        "Erreur",
        "Vous ne pouvez éxecuter cette commande que depuis un ticket !",
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
    guild.members.cache.array().forEach(async (member) => {
      if (
        args[0] == member.user.username ||
        args[0] == member.user.username + "#" + member.user.discriminator
      ) {
        find = true;

        const retrieved = await db("hallyos_tickets_externals").where({
          ticket_id: ticket.id,
          discord_id: member.id,
        });

        if (retrieved.length > 0) {
          channel
            .updateOverwrite(member, {
              ADD_REACTIONS: false,
              SEND_MESSAGES: false,
              READ_MESSAGE_HISTORY: false,
              ATTACH_FILES: false,
              EMBED_LINKS: false,
              VIEW_CHANNEL: false,
            })
            .then(async () => {
              hallyos.helpers.record.discordAction(
                cmder,
                "REMOVE_USER_TO_TICKET",
                args[0] + ";" + ticket.id
              );
              hallyos.discord.client.sendInfo(
                `Mise à jour participants`,
                `${cmder} vient de retirer ${member} du ticket`,
                channel
              );
              hallyos.log.info(
                `Successfully removed ${member.user.username} from ticket ` +
                  ticket.id
              );
              await db("hallyos_tickets_externals")
                .where({
                  ticket_id: ticket.id,
                  discord_id: member.id,
                })
                .del();
            });
        } else {
          const m = await hallyos.discord.client.sendError(
            "Erreur",
            `L'utilisateur ${member.user.username} n'est pas présent ici !`,
            channel
          );
          setTimeout(() => {
            m.delete();
          }, 5000);
        }

        return;
      }
    });

    message.delete();

    if (!find) {
      const message = await hallyos.discord.client.sendWarn(
        "Utilisateur introuvable",
        "Cette utilisateur est introuvable !",
        channel
      );
      setTimeout(() => {
        message.delete();
      }, 5000);
    }
  },
};
