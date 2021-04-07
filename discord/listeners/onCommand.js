module.exports = {
  listen: 'command',
  run: (message) => {
    let args = message.toString().split(' ');
    let argsPop = 0;
    const channel = message.channel;
    const member = message.member;

    if (!args[0].startsWith(hallyos.config.discord.prefix)) return;
    args[0] = args[0].substr(hallyos.config.discord.prefix.length);

    while (args.length > 0) {
      let command = _.get(hallyos.discord.commands, args.join('.'), null);
      if (command != null && command.command != undefined) {
        if (command.param == argsPop) {
          hallyos.helpers.record.discordAction(
            member,
            'EXECUTE_COMMAND',
            message.toString()
          );
          command.execute(
            message.toString().split(' ').slice(args.length),
            channel,
            member,
            message
          );
          return;
        } else {
          hallyos.discord.client.sendError(
            'Erreur ❌ ',
            argsPop < command.param
              ? 'Il manque des paramètres ! '
              : 'Paramètre en plus' +
                  ' \n\n Usage:\n' +
                  hallyos.config.discord.prefix +
                  command.usage,
            channel
          );
          return;
        }
      }
      args.pop();
      argsPop++;
    }

    hallyos.discord.client.sendError(
      'Commande inconnue❓',
      "Il semblerait que cette commande n'existe pas !",
      channel
    );
  },
};
