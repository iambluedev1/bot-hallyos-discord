const Discord = require('discord.js');
const TimeAgo = require('javascript-time-ago');
const timeAgo = new TimeAgo('fr');

module.exports = {
  command: 'list',
  description: 'Liste tous les hôtes',
  usage: 'host list',
  roles: hallyos.config.discord.status.roles,
  execute: (args, channel, member, message) => {
    fetch('http://localhost:' + hallyos.config.port + '/api/hosts?bot=true')
      .then((e) => e.text())
      .then((text) => {
        message.delete();
        const json = JSON.parse(text);
        hallyos.discord.client.sendMessage('Liste des hôtes : ', channel);
        json.forEach((v, i) => {
          const response = new Discord.MessageEmbed()
            .setTitle(`**${v.name || v.host}**`)
            .addFields([
              {
                name: "Information sur l'hôte",
                value: `hote: ${v.host}:${v.port}\najouté le : ${new Date(
                  v.created_at
                ).toLocaleString('fr', { timeZone: 'Europe/Paris' })}`,
              },
              {
                name: "Etat de l'hôte",
                value: `état: **${v.ping_state ? 'EN LIGNE' : 'HORS LIGNE'}**${
                  v.ping_state
                    ? `\nTemps de réponse: ${v.last_response_time}ms`
                    : ''
                }`,
              },
              {
                name: "Identifiant de l'hôte",
                value: v.id,
              },
            ])
            .setColor(
              v.ping_state
                ? hallyos.config.discord.colors.success
                : hallyos.config.discord.colors.error
            )
            .setFooter(
              `Cet hôte a été verifié ${timeAgo.format(v.last_check_at * 1000)}`
            );

          if (v.description) response.setDescription(v.description);

          hallyos.discord.client.sendMessage(response, channel);
        });
      })
      .catch((e) => {
        console.log(e);
      });
  },
};
