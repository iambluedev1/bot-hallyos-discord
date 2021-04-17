const getIp = (req) => {
  if (req.headers["cf-connecting-ip"]) {
    return req.headers["cf-connecting-ip"];
  } else {
    return (
      req.ip || (req.connection && req.connection.remoteAddress) || undefined
    );
  }
};

module.exports = async (req, res, next) => {
  if (
    (req.get("host") || "") == "localhost:" + hallyos.config.port ||
    req.query.bot
  ) {
    return next();
  }

  if (
    req.originalUrl.startsWith("/form") ||
    req.header("Host") == hallyos.config.http.base
  ) {
    next();
    return;
  }

  if (req.query.apiKey != hallyos.config.http.apiKey) {
    hallyos.log.warn(
      "Not allowed ip (" + getIp(req) + ") tried to access to the site"
    );
    res.status(403).json({ error: true, message: "Forbidden" });
    return;
  }

  next();
};
