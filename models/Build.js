/**
 * @name Build
 * @fileoverview general Build object
 */

var Common = require('./../lib/Common');
var CircularJSON = Common.circularJSON;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Constructor of Archiver
 * initialises archiver detection
 * @class
 */
function Build(BRID, client, platform) {
    this._BRID = BRID;
    this._BID = BRID + '-' + platform;

    this._client = client;
    this._platform = platform;
    this._status = Build.STATUS.unknown;

    this._bufis = [];
    this._logs = [];
}

util.inherits(Build, EventEmitter);

Build.STATUS = require('./BuildStatus');

Build.prototype.getBRID = function () {
    return this._BRID;
};

Build.prototype.getBID = function () {
    return this._BID;
};

Build.prototype.getPlatform = function () {
    return this._platform;
};

Build.prototype.getLogs = function () {
    return this._logs;
};

Build.prototype.addLog = function (log) {
    this._logs.push(log);
};

Build.prototype.getClient = function () {
    return this._client;
};

Build.prototype.getBuildFiles = function () {
    return this._bufis;
};

Build.prototype.addBuildFile = function (file) {
    this._bufis.push(file);
};

Build.prototype.toString = function () {
    return CircularJSON.stringify(this);
};

Build.prototype.setStatus = function (status) {
    this._status = Build.STATUS[status] || Build.STATUS['unknown'];
    this.emit('status', this._status);
};

// @todo: move to agent
/*Build.prototype.save = function(buildPath, callback) {
    var build = this;
    var json = CircularJSON.stringify(build.serialize({
        files: true,
        outputFiles: true,
        platforms: true,
        content: false
    }, {
        files: true,
        outputFiles: true,
        content: false
    }), null, 4);

    try {
        fs.writeFileSync(buildPath, json);
    } catch (e) {
        if (e) {
            return callback && callback("Error while saving build.json for {0}:\n{1}".format(build.Id(), e), e, buildPath, json);
        }
    }
    if (callback) {
        callback(null, null, buildPath, json);
    }
};*/

module.exports = Build;