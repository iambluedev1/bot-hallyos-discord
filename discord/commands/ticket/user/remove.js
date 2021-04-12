module.exports = {
  command: 'remove',
  description: 'Retirer un utilisateur du ticket',
  usage: "ticket user remove (:word|<nom d'utilisateur>)",
  roles: hallyos.config.discord.support.roles,
  execute: async (args, channel, member, message) => {},
};
