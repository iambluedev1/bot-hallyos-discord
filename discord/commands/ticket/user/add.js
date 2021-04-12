module.exports = {
  command: 'add',
  description: 'Ajouter un utilisateur au ticket',
  usage: "ticket user add (:word|<nom d'utilisateur>)",
  roles: hallyos.config.discord.support.roles,
  execute: async (args, channel, member, message) => {
    message.guild.members.fetch().then((e) => console.log(e));
  },
};
