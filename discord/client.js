const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const walk = require('../src/utils/walk');
const msgUtils = require('./utils/msg');
const { hasRole } = require('./utils/hasRole');
const TimeAgo = require('javascript-time-ago');
const fr = require('javascript-time-ago/locale/fr');
TimeAgo.addDefaultLocale(fr);

new Promise((resolve, reject) => {
  fs.readdirSync('./discord/listeners').forEach((file) => {
    let listener = require('./listeners/' + file);
    hallyos.log.info('Loader discord listener ' + file);
    client.on(listener.listen, listener.run);
  });

  const replaceAll = (str, search, replacement) => {
    var newStr = '';
    if (_.isString(str)) {
      newStr = str.split(search).join(replacement);
    }
    return newStr;
  };

  const formatCommand = (name, command) => {
    let regexCommand = command.usage;
    if (regexCommand == undefined) {
      throw new Error(name + ' is not valid');
    }

    regexCommand = regexCommand.replace(
      /\(([:a-zA-Z]+)\|[a-zA-ZÀ-ÖØ-öø-ÿ:_<>'"` ]+\)/gm,
      '($1)'
    );
    regexCommand = replaceAll(regexCommand, ':num', '-?[0-9]+');
    regexCommand = replaceAll(regexCommand, ':enum', '[a-zA-Z0-9_]+');
    regexCommand = replaceAll(
      regexCommand,
      ':word',
      '[a-zA-ZÀ-ÖØ-öø-ÿ0-9-_:/]+'
    );
    regexCommand = replaceAll(regexCommand, ':tag', '[a-zA-ZÀ-ÖØ-öø-ÿ#0-9]+');
    regexCommand = replaceAll(regexCommand, ':id', '[a-zA-Z0-9-]+');
    regexCommand = replaceAll(regexCommand, ':all', '.*');
    command.regex = new RegExp(regexCommand, 'im');
    command.match = (cmd) => {
      var matches = cmd.match(command.regex);
      return matches;
    };
    return command;
  };

  walk('./discord/commands', function (err, files) {
    if (err) throw err;
    files.forEach((file) => {
      let command = require(file);
      let fileName = file.split('/commands/')[1];
      global['hallyos']['discord']['commands'].push(
        formatCommand(fileName, command)
      );
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
  hallyos.discord.client.hasRole = hasRole;
  hallyos.discord.reactMessage = null;
  client.login(hallyos.config.discord.token).then(() => {
    hallyos.log.info('Discord client connected');
  });
});
