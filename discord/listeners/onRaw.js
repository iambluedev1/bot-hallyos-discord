const { TextChannel } = require('discord.js');

module.exports = {
  listen: 'raw',
  run: async (packet) => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t))
      return;

    const channel = hallyos.discord.client.channels.resolve(
      packet.d.channel_id
    );

    if (!channel || (channel && !(channel instanceof TextChannel))) return;
    if (channel.messages.cache.has(packet.d.message_id)) return;

    const message = await channel.messages.fetch(packet.d.message_id);

    if (message) {
      const emoji = packet.d.emoji.id
        ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
        : packet.d.emoji.name;
      const reaction = message.reactions.resolve(emoji);
      const user = hallyos.discord.client.users.resolve(packet.d.user_id);

      if (packet.t === 'MESSAGE_REACTION_ADD') {
        hallyos.discord.client.emit('messageReactionAdd', reaction, user);
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
        hallyos.discord.client.emit('messageReactionRemove', reaction, user);
      }
    }
  },
};
