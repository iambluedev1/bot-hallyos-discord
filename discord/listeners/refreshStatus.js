const Discord = require('discord.js');
const TimeAgo = require('javascript-time-ago');
const timeAgo = new TimeAgo('fr');

module.exports = {
  listen: 'refreshStatus',
  run: async () => {
    const channelStatus = hallyos.discord.client.channels.cache.get(
      hallyos.config.discord.status.channelId
    );

    if (channelStatus) {
      const response = await fetch(
        'http://localhost:' + hallyos.config.port + '/api/hosts?bot=true'
      );
      const json = JSON.parse(await response.text());
      const globalStatus = json
        .map((host) => host.ping_state)
        .reduce((allValid, valid) => allValid && valid, true);
      const content = json
        .map(
          (host) => `**${host.ping_state ? '✅' : '❌'} ${
            host.name || host.host
          }**
        ${host.description ? host.description + '\n' : ''}${
            host.ping_state
              ? 'Aucun problème a signaler sur ce service'
              : 'Ce service est actuellement hors ligne'
          }
        mis à jour ${timeAgo.format(host.last_check_at * 1000)} 
        `
        )
        .join('\n');

      const embed = new Discord.MessageEmbed();
      embed.setTitle('⚙️ STATUS DE NOTRE INFRASTRUCTURE ⚙️');
      embed.setColor(
        globalStatus
          ? hallyos.config.discord.colors.success
          : hallyos.config.discord.colors.error
      );
      embed.setThumbnail(
        'https://cdn.mee6.xyz/guild-images/761999859686309928/e9335c78cbce9f340738ec9591f279b55658c79d3e0a040e0c834a380488f03f.png'
      );
      embed.addField(
        'Nos services',
        (globalStatus
          ? 'Super ! 😁 Tous nos systèmes sont opérationnels !'
          : 'Notre infrastructure rencontre des problèmes 🙁') +
          '\n\n' +
          content
      );
      embed.setFooter('Chaque service sont vérifiés toutes les 5 minutes');

      channelStatus.messages
        .fetch({ limit: 1 })
        .then((messages) => {
          let lastMessage = messages.first();

          if (lastMessage == undefined || !lastMessage.author.bot) {
            hallyos.discord.client.sendMessage(embed, channelStatus);
          } else {
            lastMessage.edit(embed);
          }
        })
        .catch((e) => hallyos.log.error(e));
    }
  },
};
