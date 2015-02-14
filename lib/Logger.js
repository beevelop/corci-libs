/**
 * @name Logger
 * @fileoverview initializes winston
 */

var path = require('path');
var winston = require('winston');
var extend = require('extend');
var fs = require('fs-extra-promise');

// Import winston-transports
require('./includes/winston-socket');

var logdir = path.resolve('./logs');

var transports = [];

try {
    fs.ensureDirSync(logdir);

    transports.push(new winston.transports.DailyRotateFile({
        level: 'warn',
        silent: false,
        colorize: false,
        timestamp: true,
        filename: './logs/log',
        maxsize: 100 * 1024 * 1024, //100MB
        maxFiles: 100,
        //stream: null,
        json: false,
        //prettyPrint: true,
        //depth: 42
        logstash: false,
        showLevel: true,
        //formatter: undefined,
        //tailable: true,
        datePattern: '.yyyy-MM-dd'
    }));

} catch (err) {
    console.error('Logs directory could not be ensured! Logs won\'t be saved...');
    console.log(err);
} finally {

    transports.push(new winston.transports.Console({
        level: 'silly',
        slient: false,
        colorize: true,
        timestamp: false,
        prettyPrint: true,
        depth: 3,
        showLevel: true,
        formatter: undefined,
        handleExceptions: true
    }));

    winston.remove(winston.transports.Console)
        // pretty print output console
        .cli();

    winston.loggers.add('local', {
        transports: transports
    });

    winston.exitOnError = true;
}

var Logger = winston.loggers.get('local');

Logger.ensureLevel = function (name, prio, color) {
    console.log('Ensuring '+name+' :: '+prio+' ::: '+color);
    if (!(name in this.levels)) {
        var tmp = {};
        tmp[name] = prio || 3;
        var levels = extend(this.levels, tmp);
        this.setLevels(levels);

        tmp[name] = color || 'rainbow';
        winston.addColors(tmp);
    }
};

Logger.addRemote = function (socket, event, levels, colors) {

    event = event || 'log';

    var _this = this;
    socket.on(event, function (level, msg, meta) {
        _this.ensureLevel(level, meta.prio, meta.color);
        _this.log(level, msg, meta);
    });

    // Add winston-socket to the transports
    transports.push(new winston.transports.Socket({
        socket: socket,
        event: event
    }));

    var remote = {
        transports: transports,
        levels: extend(true, this.levels, levels || {}),
        colors: {}
    };

    // Add color for each level
    for (var level in levels) {
        if (levels.hasOwnProperty(level)) {
            remote.colors[level] = (colors && colors[level]) || 'rainbow';
        }
    }

    // extend Logger with remote attribute
    this.remote = new (winston.Logger)(remote);
};

module.exports = Logger;