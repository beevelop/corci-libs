/**
 * @name Common
 * @fileoverview library for all shared dependencies
 */

var shortid = require('shortid');
var filesize = require('filesize');

module.exports = {
    elapsed: require('elapsed'),
    async: require('async'),
    multiGlob: require('multi-glob').glob,
    fsExtra: require('fs-extra-promise'),
    yargs: require('yargs'),
    extend: require('extend'),
    circularJSON: require('circular-json'),
    getShortID: shortid.generate,
    getFilesize: filesize,
    Promise: require('bluebird'),
    socket: {
        client: require('socket.io-client'),
        stream: require('socket.io-stream')
    }
};