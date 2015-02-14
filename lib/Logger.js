/**
 * @name Logger
 * @fileoverview initializes winston
 */

var path = require('path');
var winston = require('winston');
var fs = require('fs-extra-promise');

var logdir = path.resolve('./logs');

try {
    fs.ensureDirSync(logdir);

    winston.add(winston.transports.DailyRotateFile, {
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
    });
} catch (err) {
    console.error('Logs directory could not be ensured! Logs won\'t be saved...');
    console.log(err);
} finally {
    winston
        .remove(winston.transports.Console)
        .add(winston.transports.Console, {
            level: 'silly',
            slient: false,
            colorize: true,
            timestamp: false,
            prettyPrint: true,
            depth: 3,
            showLevel: true,
            formatter: undefined,
            handleExceptions: true
        })
        // pretty print output console
        .cli();

    winston.exitOnError = true;
}

module.exports = winston;