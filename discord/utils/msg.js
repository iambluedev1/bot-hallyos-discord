const Discord = require('discord.js');

module.exports.sendError = (title, message, channel, footer, color) => {
  return module.exports.sendEmbed(
    title,
    message,
    channel,
    footer,
    color || hallyos.config.discord.colors.error
  );
};

module.exports.sendInfo = (title, message, channel, footer, color) => {
  return module.exports.sendEmbed(
    title,
    message,
    channel,
    footer,
    color || hallyos.config.discord.colors.info
  );
};

module.exports.sendWarn = (title, message, channel, footer, color) => {
  return module.exports.sendEmbed(
    title,
    message,
    channel,
    footer,
    color || hallyos.config.discord.colors.warn
  );
};

module.exports.sendSuccess = (title, message, channel, footer, color) => {
  return module.exports.sendEmbed(
    title,
    message,
    channel,
    footer,
    color || hallyos.config.discord.colors.success
  );
};

module.exports.sendEmbed = (title, message, channel, footer, color) => {
  const response = new Discord.MessageEmbed().setColor(color);

  if (message.length > 1024) {
    let chunks = [''];
    let lastChunkIndex = 0;

    message.split('\n').forEach((v) => {
      if (chunks[lastChunkIndex].length + v.length < 1000) {
        chunks[lastChunkIndex] += '\n' + v;
      } else {
        chunks[++lastChunkIndex] = v;
      }
    });

    chunks.forEach((v, i) => {
      if (v.trim() != '')
        response.addField(
          `**${title} - Page ${i + 1}/${chunks.length}**`,
          `${v}`
        );
    });
  } else {
    response.addField(`**${title}**`, `${message}`);
  }

  if (footer != undefined) response.setFooter(footer);

  return module.exports.sendMessage(response, channel);
};

module.exports.sendMessage = (message, channel) => {
  return channel.send(message);
};
