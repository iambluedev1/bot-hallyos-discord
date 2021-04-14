const moment = require('moment');

module.exports = {
  interval: '*/10 * * * * *',
  active: true,
  onTick: async () => {
    const giveways = await db('hallyos_giveways')
      .where({ scheduled: true })
      .select();

    for await (const giveway of giveways) {
      const diffSeconds = moment(giveway.end_set_at).diff(moment(), 'seconds');

      if (diffSeconds < 0 && giveway.last_alert != 'ENDED') {
        hallyos.log.info('Giveway ' + giveway.id + ' is now ended !');
        await db('hallyos_giveways')
          .update({ scheduled: false, last_alert: 'ENDED' })
          .where({ id: giveway.id });
        hallyos.event.emit('to-master', { event: 'givewayEnd', args: giveway });
        continue;
      } else if (
        giveway.last_alert != 'END_IN_ONE_WEEK' &&
        diffSeconds < 604800 &&
        diffSeconds > 86400
      ) {
        hallyos.log.info('Giveway ' + giveway.id + ' will end in one week !');
        await db('hallyos_giveways')
          .update({ last_alert: 'END_IN_ONE_WEEK' })
          .where({ id: giveway.id });
        hallyos.event.emit('to-master', {
          event: 'alertGiveway',
          args: { giveway, type: 'END_IN_ONE_WEEK' },
        });
        continue;
      } else if (
        giveway.last_alert != 'END_IN_ONE_DAY' &&
        diffSeconds < 86400 &&
        diffSeconds > 3600
      ) {
        hallyos.log.info('Giveway ' + giveway.id + ' will end in one day !');
        await db('hallyos_giveways')
          .update({ last_alert: 'END_IN_ONE_DAY' })
          .where({ id: giveway.id });
        hallyos.event.emit('to-master', {
          event: 'alertGiveway',
          args: { giveway, type: 'END_IN_ONE_DAY' },
        });
        continue;
      } else if (
        giveway.last_alert != 'END_IN_ONE_HOUR' &&
        diffSeconds < 3600 &&
        diffSeconds > 0
      ) {
        hallyos.log.info('Giveway ' + giveway.id + ' will end in one hour !');
        await db('hallyos_giveways')
          .update({ last_alert: 'END_IN_ONE_HOUR' })
          .where({ id: giveway.id });
        hallyos.event.emit('to-master', {
          event: 'alertGiveway',
          args: { giveway, type: 'END_IN_ONE_HOUR' },
        });
        continue;
      }
    }

    return true;
  },
};
