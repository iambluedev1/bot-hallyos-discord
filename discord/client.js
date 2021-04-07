const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const walk = require('../src/utils/walk');
const msgUtils = require('./utils/msg');
const TimeAgo = require('javascript-time-ago');
const fr = require('javascript-time-ago/locale/fr');
TimeAgo.addDefaultLocale(fr);

new Promise((resolve, reject) => {
  fs.readdirSync('./discord/listeners').forEach((file) => {
    let listener = require('./listeners/' + file);
    hallyos.log.info('Loader discord listener ' + file);
    client.on(listener.listen, listener.run);
  });

  walk('./discord/commands', function (err, files) {
    if (err) throw err;
    files.forEach((file) => {
      let command = require(file);
      let fileName = file.split('/commands/')[1];
      if (!fileName.includes('/')) {
        _.merge(global['hallyos']['discord']['commands'], command);
      } else {
        let parts = fileName.split('/');
        parts.pop();
        parts.push(command.command);
        _.set(hallyos.discord.commands, parts.join('.'), command);
      }
      hallyos.log.debug('Loaded Discord Command ' + fileName);
    });
  });

  resolve();
}).then(() => {
  hallyos.discord.client = client;
  hallyos.discord.client.sendError = msgUtils.sendError;
  hallyos.discord.client.sendInfo = msgUtils.sendInfo;
  hallyos.discord.client.sendSuccess = msgUtils.sendSuccess;
  hallyos.discord.client.sendWarn = msgUtils.sendWarn;
  hallyos.discord.client.sendMessage = msgUtils.sendMessage;
  hallyos.discord.client.sendEmbed = msgUtils.sendEmbed;
  hallyos.discord.reactMessage = null;
  client.login(hallyos.config.discord.token);
});
