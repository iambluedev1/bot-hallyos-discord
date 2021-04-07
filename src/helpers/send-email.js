const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports.sendEmail = ({ to, subject, content, from }) => {
  if (from == undefined) from = hallyos.config.smtp.from.NO_REPLY;

  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(
      smtpTransport(hallyos.config.smtp.transporter)
    );

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        hallyos.log[
          error.message.includes('all recipients were rejected')
            ? 'warn'
            : 'error'
        ](`Unable to send email to ${to} [${error.message}]`);
        return reject(error.message);
      }

      hallyos.log.info(`Email successfully sent to ${to} [${info.messageId}]`);
      return resolve();
    });
  });
};
