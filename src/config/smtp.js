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
    NO_REPLY: "HallyosBot - Report <hallyos-bot@poneyhost.eu>",
  },
  lists: {
    ADMIN: "admin <admin@hallyos.com>",
    DEV: "dev <dev@hallyos.com>",
  },
};
