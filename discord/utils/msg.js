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
  const response = new Discord.MessageEmbed()
    .addField(`**${title}**`, `${message}`)
    .setColor(color);

  if (footer != undefined) response.setFooter(footer);

  return module.exports.sendMessage(response, channel);
};

module.exports.sendMessage = (message, channel) => {
  return channel.send(message);
};
