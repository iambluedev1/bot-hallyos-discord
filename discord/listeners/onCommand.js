module.exports = {
  listen: 'command',
  run: (message) => {
    let cmd = message.toString();
    if (!cmd.startsWith(hallyos.config.discord.prefix)) return;
    cmd = cmd.substr(hallyos.config.discord.prefix.length);

    const channel = message.channel;
    const member = message.member;

    for (let command of hallyos.discord.commands) {
      let matches = null;

      if ((matches = command.match(cmd)) != null) {
        if (
          command.roles != undefined &&
          !hallyos.discord.client.hasRole(member, command.roles)
        ) {
          hallyos.discord.client.sendError(
            'Commande inconnue❓',
            "Il semblerait que cette commande n'existe pas !",
            channel
          );
          return;
        }
        const args = _.filter(matches, (e) => e != cmd && !_.isObject(e));
        hallyos.helpers.record.discordAction(
          member,
          'EXECUTE_COMMAND',
          message.toString()
        );
        command.execute(args, channel, member, message);
        return;
      }
    }

    hallyos.discord.client.sendError(
      'Commande inconnue❓',
      "Il semblerait que cette commande n'existe pas !",
      channel
    );
  },
};
