const morgan = require('morgan');

const getIp = (req) => {
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  } else {
    return (
      req.ip || (req.connection && req.connection.remoteAddress) || undefined
    );
  }
};

morgan.token('remote-addr', (req) => {
  return getIp(req);
});

morgan.token('origin', (req) => {
  let origin = req.get('origin') || req.get('host');
  try {
    return origin.replace('https://', '').replace('http://', '');
  } catch (e) {
    return 'Unknown';
  }
});

morgan.token('referer', (req) => {
  return req.header('Referer') || '';
});

module.exports = async (req, res, next) => {
  morgan(hallyos.config.morgan.format, {
    stream: {
      write: (message) => {
        if (hallyos.config.morgan.excludes.includes(req.originalUrl)) return;
        if (
          (req.get('host') || '') == 'localhost:' + hallyos.config.port &&
          req.query.bot
        )
          return;
        if (req.method == 'OPTION') return;
        let fn = 'info';

        if (res.statusCode >= 400 && res.statusCode < 500) fn = 'warn';
        else if (res.statusCode >= 500) fn = 'error';

        hallyos.log[fn](message.trim());
        hallyos.helpers.record.apiAction(
          getIp(req),
          'action' in res ? res.action.toUpperCase() : 'UNKNOWN',
          message.trim()
        );
      },
    },
  })(req, res, next);
};
