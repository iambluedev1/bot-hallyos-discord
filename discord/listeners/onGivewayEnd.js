module.exports = {
  listen: 'givewayEnd',
  run: async (giveway) => {
    const retrieved = await db('hallyos_giveways').where({
      id: giveway.id,
      last_alert: 'RESULTS',
    });

    if (retrieved.length > 0) {
      return;
    }

    hallyos.log.info(
      'Giveway ' + giveway.id + ' ended, starting to pick winner'
    );

    await db('hallyos_giveways')
      .update({ last_alert: 'RESULTS' })
      .where({ id: giveway.id });

    const winners = await hallyos.helpers.giveway.roll(giveway);
    const guild = hallyos.discord.client.guilds.resolve(
      hallyos.config.discord.guildId
    );
    const winnedMembers = _.filter(guild.members.cache.array(), (m) =>
      winners.map((w) => w.id).includes(m.user.id)
    );

    hallyos.log.info(
      winnedMembers
        .map((m) => m.user.username + '(' + m.user.id + ')')
        .join(', ') +
        ' winned the giveway ' +
        giveway.id +
        ' !'
    );

    const tuple = [];

    for await (let winner of winners) {
      const member = _.find(winnedMembers, (w) => w.user.id == winner.id);
      await db('hallyos_giveways_results').insert({
        giveway_id: giveway.id,
        reward_id: winner.reward.id,
        discord_id: winner.id,
        discord_username: member.user.username,
      });

      tuple.push({ member, reward: winner.reward.name });
    }
    const channelGiveway = hallyos.discord.client.channels.cache.get(
      hallyos.config.discord.giveways.channelId
    );
    hallyos.discord.client.sendSuccess(
      'Résultat du concours',
      `
    Et voici l'heure du résulat !
    Un grand merci à tous les participants.

    Pour ce concours, les gagnants sont ... 


    ${tuple.map((t) => `${t.member} (gagne **x1 ${t.reward}**)`)}
    `,
      channelGiveway
    );
  },
};
