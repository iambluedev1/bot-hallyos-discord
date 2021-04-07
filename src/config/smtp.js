module.exports.smtp = {
  transporter: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  from: {
    NO_REPLY: 'hallyos <no-reply@blackpink-access.com>',
  },
  lists: {
    ADMIN: 'admin <contact@guillaumechalons.fr>',
    DEV: 'dev <contact@guillaumechalons.fr>',
  },
};
