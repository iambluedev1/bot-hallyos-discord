const CaptainsLog = require('captains-log');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, metadata, colorize, printf } = format;
const readLastLines = require('read-last-lines');

module.exports = () => {
  const logger = createLogger({
    level: hallyos.config.log.level,
    transports: [
      new transports.File({
        filename: hallyos.config.log.file,
        handleExceptions: true,
        format: combine(
          timestamp(hallyos.config.log.timestamp),
          metadata(hallyos.config.log.metadata),
          colorize(),
          printf((info) => {
            let out = `[${info.timestamp}] ${info.message}`;
            if (info.metadata.error) {
              out = out + ' ' + info.metadata.error;
              if (info.metadata.error.stack) {
                out = out + ' ' + info.metadata.error.stack;
              }
            }
            return out.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            );
          })
        ),
      }),
      new transports.Console({
        format: format.combine(
          metadata(hallyos.config.log.metadata),
          colorize(),
          printf((info) => {
            let out = `${info.message}`;
            if (info.metadata.error) {
              out = out + ' ' + info.metadata.error;
              if (info.metadata.error.stack) {
                out = out + ' ' + info.metadata.error.stack;
              }
            }
            return out;
          })
        ),
      }),
    ],
    exitOnError: false,
  });

  let timeout = null;
  const sendEmail = (message) => {
    readLastLines
      .read(hallyos.config.log.file, hallyos.config.log.email.logLinesCount)
      .then(async (lines) => {
        await hallyos.helpers.sendEmail({
          to: hallyos.config.smtp.lists.DEV,
          subject:
            (hallyos.config.environment === 'production'
              ? '(env: prod) '
              : '(env: dev) ') + message,
          content: lines,
        });
      });
  };

  hallyos.log = CaptainsLog({ custom: logger });
  hallyos.log._error = hallyos.log.error;
  hallyos.log.error = (message, options) => {
    if (options == undefined) hallyos.log._error(message);
    else hallyos.log._error(message, options);

    if (hallyos.config.environment == 'production') {
      if (timeout != null) clearTimeout(timeout);
      timeout = setTimeout(
        () => sendEmail(message),
        1000 * hallyos.config.log.email.wait
      );
    }
  };
};
