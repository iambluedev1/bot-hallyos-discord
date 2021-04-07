const tcp = require('../utils/tcp');

module.exports.ping = (address, port, locale, timeZone) => {
  return new Promise((resolve, reject) => {
    if (locale == undefined || locale == null || locale == '')
      locale = hallyos.config.ping.defaultLocale;
    if (timeZone == undefined || timeZone == null || timeZone == '')
      timeZone = hallyos.config.ping.defaultTimeZone;

    hallyos.log.debug(
      `ping: ${address}:${port} with locale: ${locale} && timeZone: ${timeZone}`
    );

    new tcp(
      {
        address,
        port,
      },
      function (error, data) {
        data.error = error;

        hallyos.log.debug(
          'ping: ' +
            address +
            ':' +
            port +
            ' is ' +
            (error ? 'not reachable' : 'reachable')
        );
        hallyos.log.debug(data);

        resolve(data);
      }
    );
  });
};
