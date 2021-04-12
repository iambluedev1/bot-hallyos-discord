const moment = require('moment');

module.exports = {
  command: 'schedule',
  description: 'Définir la date de fin du concours',
  usage:
    'giveway (:word|<name>) schedule (:word|<date au format YYYY-MM-DD>) (:word|<heure au format HH:MM>)',
  roles: hallyos.config.discord.giveways.roles,
  execute: async (args, channel, member, message) => {
    const retrieved = await db('hallyos_giveways')
      .where({ name: args[0] })
      .select();

    if (retrieved.length == 0) {
      hallyos.discord.client.sendError(
        'Oups',
        'Aucun giveway ne porte ce nom !',
        channel
      );
      return;
    }

    if (retrieved[0].scheduled) {
      hallyos.discord.client.sendError(
        'Oups',
        'Vous ne pouvez pas modifier un concours qui est lancé !',
        channel
      );
      message.delete();
      return;
    }

    const date = args[1];
    const hour = args[2];
    const end_at = date + ' ' + hour;

    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      hallyos.discord.client.sendError(
        'Oups',
        "La date que vous avez indiqué n'est pas valide, elle doit être sous la forme YYYY-MM-DD. Example: 2021-04-12",
        channel
      );
      return;
    }

    if (!moment(end_at, 'YYYY-MM-DD HH:mm', true).isValid()) {
      hallyos.discord.client.sendError(
        'Oups',
        "L'heure que vous avez indiqué n'est pas valide, elle doit être sous la forme HH:MM. Example: 12:45",
        channel
      );
      return;
    }

    if (moment(end_at, 'YYYY-MM-DD HH:mm', true).isBefore(moment())) {
      hallyos.discord.client.sendError(
        'Oups',
        'Vous ne pouvez pas prévoir un concours dans le passé 🙄',
        channel
      );
      return;
    }

    const m = moment(end_at, 'YYYY-MM-DD HH:mm', true);
    hallyos.discord.client.sendSuccess(
      'Date définie !',
      `La date de fin du concours à bien été défini pour le  ${m
        .locale('fr')
        .format('D MMMM YYYY à HH:mm')} (dans ${m.diff(
        moment(),
        'days'
      )} jours)`,
      channel
    );
    await db('hallyos_giveways')
      .update({ end_set_at: end_at })
      .where({ id: retrieved[0].id });

    hallyos.log.info(
      'Date of giveway ' + retrieved[0].id + ' has been set to ' + end_at
    );
    hallyos.helpers.record.discordAction(
      member,
      'GIVEWAY_SET_SCHEDULE',
      retrieved[0].id
    );
  },
};
