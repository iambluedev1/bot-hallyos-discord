module.exports = {
  command: 'delete',
  description: 'Supprime un hôte',
  usage: "host delete (:id|<uuid de l'hote>)",
  roles: hallyos.config.discord.status.roles,
  execute: (args, channel, member, message) => {
    if (!validator.isUUID(args[0])) {
      message.delete();
      hallyos.discord.client.sendError(
        '❌ Erreur',
        "Le paramètre indiqué n'est pas un identifiant valide !",
        channel
      );
      return;
    }

    fetch(
      'http://localhost:' +
        hallyos.config.port +
        '/api/host/' +
        args[0] +
        '?bot=true',
      {
        method: 'DELETE',
      }
    )
      .then((e) => {
        if (e.status == '400') {
          hallyos.discord.client.sendWarn(
            'Oups 😅',
            'Il semblerait que nous ne connaissions pas cet identifiant.',
            channel
          );
        } else {
          hallyos.discord.client.sendSuccess(
            'Super ✅',
            "L'hôte a bien été supprimé !",
            channel
          );
          hallyos.helpers.record.discordAction(member, 'DELETED_HOST');
        }
        message.delete();
      })
      .catch((e) => {
        hallyos.log.error(e);
        hallyos.discord.client.sendError(
          'Oups 😩',
          "Une erreur est survenue durant l'execution de cette commande.\nNotre équipe en a été notifié\nVeuillez recommencer dans quelques instants.",
          channel
        );
        message.delete();
      });
  },
};
