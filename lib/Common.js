var shortid = require('shortid');
var filesize = require('filesize');

module.exports = {
    elapsed: require('elapsed'),
    async: require('async'),
    multiGlob: require('multi-glob'),
    fsExtra: require('fs-extra'),
    yargs: require('yargs'),
    extend: require('extend'),
    getShortID: shortid.generate,
    getFilesize: filesize
};