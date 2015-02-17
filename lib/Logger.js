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

Logger._remote = new (winston.Logger)({
    transports: [new winston.transports.Socket({
        level: 'silly'
    })]
});

Logger.addPushover = function (userKey, token, level) {
    var Pushover = require('winston-pushover').Pushover;
    this.add(Pushover, {
        //sound: 'customsound',
        level: level || 'info',
        silent: false,
        userKey: userKey,
        token: token
    });
};

Logger.ensureLevel = function (name, prio, color) {
    if (!(name in this.levels)) {
        var tmp = {};
        tmp[name] = prio || 3;
        var levels = extend(this.levels, tmp);
        this.setLevels(levels);

        tmp[name] = color || 'rainbow';
        winston.addColors(tmp);
    }
};

Logger.socketLogFn = function (level, socket, event, opts) {
    var _this = this;
    return function (args) {
        if (opts.mirror) {
            _this[level].apply(_this, arguments);
        }

        if (arguments[arguments.length - 1] !== null &&
            typeof arguments[arguments.length - 1] === 'object') {
            arguments[arguments.length - 1].socket = socket;
            arguments[arguments.length - 1].event = event;
        } else {
            [].push.call(arguments, {
                socket: socket,
                event: event
            });
        }

        Logger._remote[level].apply(Logger._remote, arguments);
    };
};

Logger.extendSocket = function (target, socket, event, opts) {
    event = event || 'log';

    opts = {
        mirror: (opts && opts.mirror) === true
    };

    var funcs = extend({}, Logger._remote.levels, {
        log: null
    });

    var _this = this;
    for (var func in funcs) {
        if (funcs.hasOwnProperty(func)) {
            target.log = target.log || {};
            if (!target.log[func]) {
                target.log[func] = Logger.socketLogFn.call(_this, func, socket, event, opts);
            } else {
                _this.log('info', 'Cannot override ' + func + ' for ' + typeof target);
            }
        }
    }

    socket.on(event, function (level, msg, meta) {
        _this.ensureLevel(level, meta.prio, meta.color);
        delete meta.prio;
        delete meta.color;
        _this.log(level, msg, meta);
    });
};

Logger.addLevels = function (levels, colors) {

    colors = colors || {};

    // Add color for each level
    for (var level in levels) {
        if (levels.hasOwnProperty(level)) {
            colors[level] = (colors && colors[level]) || 'rainbow';
        }
    }

    levels = extend({}, this.levels, levels || {});

    winston.addColors(colors);
    winston.setLevels(levels);
    this.setLevels(levels);
    this._remote.setLevels(levels);
};

module.exports = Logger;