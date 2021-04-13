const pickRandom = require('pick-random');

const checkWinnerEntry = async (user) => {
  return true;
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

  const rolledWinners = pickRandom(participants, { count: nbRewards });
  const winners = [];

  for await (const rolledWinner of rolledWinners) {
    const isValidEntry =
      (await checkWinnerEntry(rolledWinner)) &&
      !winners.some((winner) => winner.id === rolledWinner.id);
    if (isValidEntry) winners.push({ id: rolledWinner });
    else {
      for (const user of participants) {
        const alreadyRolled = winners.some((winner) => winner.id === user);
        if (alreadyRolled) continue;
        const isUserValidEntry = this.checkWinnerEntry(user);
        if (!isUserValidEntry) continue;
        else {
          winners.push({ id: user });
          break;
        }
      }
    }
  }

  for await (let winner of winners) {
    const random = Math.floor(Math.random() * rewardsProp.length);
    const el = rewardsProp.splice(random, 1)[0];
    winner.reward = el;
  }

  return winners;
};
