module.exports.apiAction = (ip, action, datas) => {
  db('hallyos_logs')
    .insert({
      author_type: 'API_CALL',
      action_type: action,
      ip,
      additional_datas: datas || null,
    })
    .then((e) => {});
};
