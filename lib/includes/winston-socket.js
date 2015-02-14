var util = require('util');
var winston = require('winston');

var Socket = winston.transports.Socket = function (options) {
    winston.Transport.call(this, options);

    this.name = 'socket';
    this.socket = options.socket;
    this.event = options.event;
};

util.inherits(Socket, winston.Transport);

Socket.prototype.log = function (level, msg, meta, callback) {
    meta.color = winston.config.allColors[level] || 'rainbow';
    meta.prio = winston.levels[level] || 3;

    this.socket.emit(this.event, level, msg, meta);

    if (!callback) {
        callback(null, true);
    }
};