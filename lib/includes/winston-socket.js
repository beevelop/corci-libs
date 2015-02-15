var util = require('util');
var winston = require('winston');

var Socket = winston.transports.Socket = function (options) {
    winston.Transport.call(this, options);

    this.name = 'socket';
};

util.inherits(Socket, winston.Transport);

Socket.prototype.log = function (level, msg, meta, callback) {
    if (meta.socket) {
        meta.color = winston.config.allColors[level] || 'rainbow';
        meta.prio = winston.levels[level] || 3;

        var socket = meta.socket;
        var event = meta.event;
        delete meta.socket;
        delete meta.event;

        socket.emit(event, level, msg, meta);

        if (!callback) {
            callback(null, true);
        }
    }
};