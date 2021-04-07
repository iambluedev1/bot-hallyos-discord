'use strict';

const net = require('net');
const NS_PER_SEC = 1e9;

module.exports = function (options, callback) {
  let socket = new net.Socket();
  let startTime = process.hrtime();

  socket.setTimeout(5e3, function () {
    let data = {
      address: options.address,
      port: options.port,
      responseTime: -1,
    };

    socket.destroy();
    callback(true, data);
  });

  socket.connect(options.port, options.address, function () {
    let diff = process.hrtime(startTime);
    let responseTime = Math.floor(diff[0] * NS_PER_SEC + diff[1] / 1e6);

    let data = {
      address: options.address,
      port: options.port,
      responseTime: responseTime,
    };

    socket.destroy();

    callback(false, data);
  });

  socket.on('error', function (error) {
    let data = {
      address: options.address,
      port: options.port,
      responseTime: -1,
    };

    socket.destroy();
    callback(true, data);
  });
};
