const { toInteger } = require('lodash');

module.exports = {
  interval: '*/20 * * * * *',
  active: true,
  onTick: async () => {
    const hosts = await db('hallyos_hosts')
      .where('last_check_at', '<', toInteger(Date.now() / 1000) - 5 * 60)
      .select();
    for await (const host of hosts) {
      hallyos.log.debug('Checking ', host.id);
      const ping = await hallyos.helpers.ping(host.host, host.port);

      if (ping.error && host.ping_state == true) {
        hallyos.helpers.sendEmail({
          to: hallyos.config.smtp.lists.DEV,
          content: `Oh noo !. The host ${host.host}:${host.port} seems to be down !`,
          subject: `[PING-CHECKER] The host ${host.host}:${host.port} is down !`,
        });
      } else if (!ping.error && !host.ping_state) {
        hallyos.helpers.sendEmail({
          to: hallyos.config.smtp.lists.DEV,
          content: `Hey, good news ! It seems that the host ${host.host}:${host.port} is now online !`,
          subject: `[PING-CHECKER] The host ${host.host}:${host.port} is now up !`,
        });
      }

      await db('hallyos_hosts')
        .update({
          ping_state: !ping.error,
          last_check_at: toInteger(Date.now() / 1000),
        })
        .where({ id: host.id });

      await db('hallyos_hosts_stats').insert({
        id: host.id,
        state: !ping.error,
        response_time: ping.responseTime,
      });
    }

    return true;
  },
};
