const jwt = require('jsonwebtoken');

const signToken = (discordId, discordUsername) => {
  return jwt.sign({ discordId, discordUsername }, hallyos.config.jwt.secret, {
    expiresIn: hallyos.config.jwt.expiresIn,
  });
};

module.exports = {
  command: 'add',
  description: 'Ajouter un hôte',
  usage: 'ping add',
  execute: (args, channel, member, message) => {
    const token = signToken(member.id, member.username);
    hallyos.discord.client.sendInfo(
      '**Ajouter un hôte**',
      `Vous souhaitez ajouter un hôte ?

    Voici un lien d'une validité de 10 min vous permettant d'ajouter un hôte :
    ${hallyos.config.http.secure == true ? 'https://' : 'http://'}${
        hallyos.config.http.base
      }/form/add/${token}
    `,
      member
    );
    hallyos.helpers.record.discordAction(member, 'REQUEST_ADD_LINK');
    message.delete();
  },
};
