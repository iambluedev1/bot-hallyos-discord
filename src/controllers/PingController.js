const path = require('path');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = {
  ping: (req, res) => {
    res.action = 'PING';
    const address = req.query.address;
    const port = req.query.port;

    if (address == undefined || port == undefined) {
      return res.status(400).json({
        error: true,
        message: 'Please specify an address and a port',
      });
    }

    if (validator.isIP(address, '6')) {
      return res.status(400).json({
        error: true,
        message: 'This service does not support ipv6 address for now',
      });
    }

    if (!(validator.isIP(address, '4') || validator.isURL(address))) {
      return res.status(400).json({
        error: true,
        message: 'Please specify a valid address (url or ipv4)',
      });
    }

    if (!validator.isPort(port)) {
      return res.status(400).json({
        error: true,
        message: 'Please specify a valid port number',
      });
    }

    hallyos.helpers.ping(address, port).then((result) => {
      return res.json({ success: true, result });
    });
  },
  add: async (req, res) => {
    res.action = 'form/add';
    try {
      const decoded = await promisify(jwt.verify)(
        req.params.token,
        hallyos.config.jwt.secret
      );

      if (
        decoded.iat + hallyos.config.discord.ping.tokenValidity * 60 >
        Date.now() / 1000
      ) {
        hallyos.log.info(`discord user (${decoded.discordId}) used the token`);
        res.set(
          'Content-Security-Policy',
          "default-src *;img-src * 'self' data: https: http:;script-src 'self' 'unsafe-inline' 'unsafe-eval' *;style-src  'self' 'unsafe-inline' *"
        );
        res.sendFile(path.join(__dirname + '/../views/add.html'));
      } else {
        hallyos.log.info('Used an invalid token (timeout)');
        res.status(403).send('Oops, token not available anymore.');
      }
    } catch (e) {
      hallyos.log.error(e);
      res.status(403).send('Oops, bad token.');
    }
  },
};
