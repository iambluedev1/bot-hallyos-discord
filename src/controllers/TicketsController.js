module.exports = {
  find: (req, res) => {
    res.action = 'tickets/find';
    const select = 'select' in req.query ? req.query.select.split(',') : '*';
    const where = 'where' in req.query ? JSON.parse(req.query.where) : {};
    if (req.params.id != undefined) {
      where.id = req.params.id;
    }
    const limit = 'limit' in req.query ? req.query.limit : 1000;

    db('hallyos_tickets')
      .select(select)
      .where(where)
      .limit(limit)
      .then(async (e) => {
        const items = await Promise.all(
          _.map(e, async (e) => {
            if (req.params.id != undefined) {
              const messages = await db('hallyos_tickets_messages').where({
                ticket_id: e.id,
              });
              e.messages = messages;
            }
            return e;
          })
        );
        if (req.params.id != undefined && items.length == 0) {
          return res
            .status(400)
            .json({ error: true, message: 'No entry matching this id' });
        } else if (req.params.id != undefined && items.length == 1) {
          res.json(items[0]);
        } else {
          res.json(items);
        }
      });
  },
  delete: async (req, res) => {
    res.action = 'tickets/delete';
    const id = req.params.id;

    if (!validator.isUUID(id)) {
      return res.status(400).json({ error: true, message: 'Invalid Id' });
    }

    const retrieved = await db('hallyos_tickets').select().where({ id });

    if (retrieved.length == 0) {
      return res
        .status(400)
        .json({ error: true, message: 'No entry matching this id' });
    }

    await db('hallyos_tickets')
      .where({ id: retrieved[0].id })
      .del()
      .then((e) => {
        hallyos.log.info('Successfully deleted tickets, ', retrieved[0]);
        res.status(200).json({ success: true });
      })
      .catch((e) => {
        hallyos.log.error(e);
        res.status(500).json({ error: true, result: e });
      });
  },
  update: async (req, res) => {
    res.action = 'tickets/update';
    const id = req.params.id;

    if (!validator.isUUID(id)) {
      return res.status(400).json({ error: true, message: 'Invalid Id' });
    }

    const retrieved = await db('hallyos_tickets').select().where({ id });

    if (retrieved.length == 0) {
      return res
        .status(400)
        .json({ error: true, message: 'No entry matching this id' });
    }

    const body = {
      state: req.body.state || retrieved[0].state,
    };

    if (body.state == retrieved[0].state) {
      return res.status(304).send();
    }

    db('hallyos_tickets')
      .update(body)
      .where({ id: retrieved[0].id })
      .then(async (e) => {
        hallyos.log.info('tickets ' + retrieved[0].id + ' successfully edited');
        res.status(204).send();
      })
      .catch((e) => {
        hallyos.log.error(e);
        res.status(500).json({ error: true, result: e });
      });
  },
};
