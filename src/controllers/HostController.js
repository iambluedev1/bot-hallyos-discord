const TABLE = 'hallyos_hosts';

module.exports = {
  find: (req, res) => {
    res.action = 'hosts/find';
    const select = 'select' in req.query ? req.query.select.split(',') : '*';
    const where = 'where' in req.query ? JSON.parse(req.query.where) : {};
    const limit = 'limit' in req.query ? req.query.limit : 1000;

    db(TABLE)
      .select(
        select,
        db('hallyos_hosts_stats')
          .select('response_time')
          .where('hallyos_hosts_stats.id', db.ref('hallyos_hosts.id'))
          .limit(1)
          .orderBy([{ column: 'at', order: 'desc' }])
          .as('last_response_time')
      )
      .where(where)
      .limit(limit)
      .then((e) => {
        return res.json(e);
      });
  },
  create: (req, res) => {
    res.action = 'hosts/create';
    const host = req.body.host;
    const port = req.body.port;
    const name = req.body.name;
    const description = req.body.description;

    if (host == undefined || port == undefined) {
      return res.status(400).json({
        error: true,
        message: 'Please specify an host and a port',
      });
    }

    if (validator.isIP(host, '6')) {
      return res.status(400).json({
        error: true,
        message: 'This service does not support ipv6 address for now',
      });
    }

    if (!(validator.isIP(host, '4') || validator.isURL(host))) {
      return res.status(400).json({
        error: true,
        message: 'Please specify a valid host (url or ipv4)',
      });
    }

    if (!validator.isPort(port)) {
      return res.status(400).json({
        error: true,
        message: 'Please specify a valid port number',
      });
    }

    db(TABLE)
      .insert({ host, port, name, description })
      .then(async (ignored) => {
        hallyos.log.info(`registered new host successfully ${host}:${port}`);
        const retrieved = (await db(TABLE).select().where({ host, port }))[0];
        hallyos.helpers.ping(host, port).then(async (result) => {
          await db(TABLE)
            .update({ ping_state: !result.error })
            .where({ id: retrieved.id });
        });
        return res.json({ success: true, result: retrieved });
      })
      .catch((e) => {
        if (e.code == 'ER_DUP_ENTRY') {
          return res.status(400).json({
            error: true,
            message: 'An entry already exist with the same host and port',
          });
        }
        hallyos.log.error(e);
        return res.status(500).json({
          error: true,
          message: 'An error occured, please check the console',
        });
      });
  },
  delete: async (req, res) => {
    res.action = 'hosts/delete';
    const id = req.params.id;

    if (!validator.isUUID(id)) {
      return res.status(400).json({ error: true, message: 'Invalid Id' });
    }

    const retrieved = await db(TABLE).select().where({ id });

    if (retrieved.length == 0) {
      return res
        .status(400)
        .json({ error: true, message: 'No entry matching this id' });
    }

    await db(TABLE)
      .where({ id: retrieved[0].id })
      .del()
      .then((e) => {
        hallyos.log.info('Successfully deleted host, ', retrieved[0]);
        res.status(200).json({ success: true });
      })
      .catch((e) => {
        hallyos.log.error(e);
        res.status(500).json({ error: true, result: e });
      });
  },
  update: async (req, res) => {
    res.action = 'hosts/update';
    const id = req.params.id;

    if (!validator.isUUID(id)) {
      return res.status(400).json({ error: true, message: 'Invalid Id' });
    }

    const retrieved = await db(TABLE).select().where({ id });

    if (retrieved.length == 0) {
      return res
        .status(400)
        .json({ error: true, message: 'No entry matching this id' });
    }

    const body = {
      name: req.body.name || retrieved[0].name,
      description: req.body.description || retrieved[0].description,
    };

    if (
      body.name == retrieved[0].name &&
      body.description == retrieved[0].description
    ) {
      return res.status(304).send();
    }

    db(TABLE)
      .update(body)
      .where({ id: retrieved[0].id })
      .then(async (e) => {
        hallyos.log.info('host ' + retrieved[0].id + ' successfully edited');
        hallyos.helpers.ping(body.host, body.port).then(async (result) => {
          await db(TABLE)
            .update({ ping_state: !result.error })
            .where({ id: retrieved[0].id });
        });
        res.status(204).send();
      })
      .catch((e) => {
        hallyos.log.error(e);
        res.status(500).json({ error: true, result: e });
      });
  },
};
