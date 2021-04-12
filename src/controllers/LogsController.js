module.exports = {
  find: (req, res) => {
    res.action = 'logs/find';
    const select = 'select' in req.query ? req.query.select.split(',') : '*';
    const where = 'where' in req.query ? JSON.parse(req.query.where) : {};
    const limit = 'limit' in req.query ? req.query.limit : 1000;

    db('hallyos_logs')
      .select(select)
      .where(where)
      .limit(limit)
      .then((e) => {
        return res.json(e);
      });
  },
};
