const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('./middleware/morgan');
const restrict = require('./middleware/restrict');
const cors = require('cors');
const compression = require('compression');

const app = express();
app.use(compression());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in an hour!',
});

app.use(helmet());
app.use(morgan);
app.use(restrict);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

let copts = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  optionsSuccessStatus: 200,
};
app.use(cors(copts));
app.options('*', cors(copts));
app.use('/api', limiter);

app.get('/api/ping', require('./controllers/PingController').ping);
app.get('/form/add/:token', require('./controllers/PingController').add);

app.get('/api/hosts', require('./controllers/HostController').find);
app.post('/api/host', require('./controllers/HostController').create);
app.patch('/api/host/:id', require('./controllers/HostController').update);
app.delete('/api/host/:id', require('./controllers/HostController').delete);

app.get('/api/tickets', require('./controllers/TicketsController').find);
app.get('/api/tickets/:id', require('./controllers/TicketsController').find);
app.patch(
  '/api/tickets/:id',
  require('./controllers/TicketsController').update
);
app.delete(
  '/api/tickets/:id',
  require('./controllers/TicketsController').delete
);

app.get('/api/logs', require('./controllers/LogsController').find);

module.exports = app;
