module.exports = {
  command: 'add',
  description: 'Ajouter un utilisateur au ticket',
  usage: 'ticket user add',
  param: 1,
  execute: async (args, channel, member, message) => {
    message.guild.members.fetch().then((e) => console.log(e));
  },
};
