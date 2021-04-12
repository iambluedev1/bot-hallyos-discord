module.exports = {
  command: 'help',
  description: "Afficher l'aide du bot",
  usage: 'help',
  execute: async (args, channel, member, message) => {
    hallyos.discord.client.sendInfo(
      'Aide',
      `
      Voici toutes les commandes : 

      ${_.map(hallyos.discord.commands, (command) => {
        if (
          command.roles != undefined &&
          !hallyos.discord.client.hasRole(member, command.roles)
        ) {
          return undefined;
        }

        const cmd = command.usage.replace(
          /\([:a-zA-Z]+\|([a-zA-ZÀ-ÖØ-öø-ÿ:_<>'"` ]+)\)/gm,
          '$1'
        );

        return `${hallyos.config.discord.prefix}${cmd} : ${command.description}`;
      })
        .filter(_.isString)
        .join('\n')}
    `,
      channel
    );

    message.delete();
  },
};
