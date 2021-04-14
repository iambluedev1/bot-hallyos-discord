const pickRandom = require('pick-random');

const checkWinnerEntry = (giveway, user) => {
  const guild = hallyos.discord.client.guilds.resolve(
    hallyos.config.discord.guildId
  );
  const member = _.find(guild.members.cache.array(), (m) => m.id == user);
  const roles = (JSON.parse(giveway.excluded_roles) || []).map((r) => r.name);
  const exclude = member.bot || hallyos.discord.client.hasRole(member, roles);
  if (exclude)
    hallyos.log.debug(
      user +
        '(' +
        member.user.username +
        ')' +
        ' need to be excluded from the giveway ' +
        giveway.id +
        '; user=' +
        member.roles.cache.array().map((r) => r.name) +
        '; exluded=' +
        roles
    );
  return !(exclude === true);
};

module.exports.roll = async (giveway) => {
  hallyos.log.info('Starting roll of giveway ' + giveway.id);
  const guild = hallyos.discord.client.guilds.resolve(
    hallyos.config.discord.guildId
  );
  let participants = [];
  hallyos.log.info('Type of the giveway is set to ' + giveway.type);
  if (giveway.type == 'REACTION') {
    participants = (
      await db('hallyos_giveways_participants').where({
        giveway_id: giveway.id,
      })
    ).map((e) => e.discord_author_id);
  } else {
    participants = guild.members.cache.array().map((e) => e.id);
  }

  participants = _.filter(participants, (p) => checkWinnerEntry(giveway, p));

  hallyos.log.info(participants.length + ' participants fetched');

  const rewards = await db('hallyos_giveways_rewards')
    .where({
      giveway_id: giveway.id,
    })
    .orderBy('quantity', 'desc');

  let rewardsProp = _.shuffle(
    _.flatMap(rewards, (r) => _.fill(new Array(r.quantity), r))
  );

  const nbRewards = _.reduce(rewards, (prev, cur) => prev + cur.quantity, 0);

  hallyos.log.info(nbRewards + ' rewards fetched');

  const winners = pickRandom(participants, { count: nbRewards }).map((p) => {
    return { id: p };
  });

  for await (let winner of winners) {
    const random = Math.floor(Math.random() * rewardsProp.length);
    const el = rewardsProp.splice(random, 1)[0];
    winner.reward = el;
  }

  return winners;
};
