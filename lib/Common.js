/**
 * @name Common
 * @fileoverview library for all shared dependencies
 */

var shortid = require('shortid');

module.exports = {
    multiGlob: require('multi-glob').glob,
    fsExtra: require('fs-extra-promise'),
    yargs: require('yargs'),
    extend: require('extend'),
    getShortID: shortid.generate,
    Promise: require('bluebird'),
    Archiver: require('node-7z'),
    socket: {
        client: require('socket.io-client'),
        stream: require('socket.io-stream')
    }
};