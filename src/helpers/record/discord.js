module.exports.discordAction = (member, action, datas) => {
  db('hallyos_logs')
    .insert({
      discord_author_id: member.id,
      discord_author_username: member.user.tag,
      author_type: 'DISCORD_MEMBER',
      action_type: action,
      additional_datas: datas || null,
    })
    .then((e) => {});
};
