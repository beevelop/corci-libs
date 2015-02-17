/**
 * @name Build
 * @fileoverview general Build object
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Build(BRID, client, platform) {
    this._BRID = BRID;
    this._BID = BRID + '-' + platform;

    this._client = client;
    this._platform = platform;
    this._status = Build.STATUS.unknown;

    this._bufis = [];
    this._artifacts = [];
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

Build.prototype.getClient = function () {
    return this._client;
};

Build.prototype.getBuildFiles = function () {
    return this._bufis;
};

Build.prototype.addBuildFile = function (file) {
    this._bufis.push(file);
};

Build.prototype.getArtifacts = function () {
    return this._artifacts;
};

Build.prototype.addArtifact = function (artifact) {
    this._artifacts.push(artifact);
};

Build.prototype.setStatus = function (status) {
    if (this._status !== status) {
        this._status = status;
        this.emit('status', this._status);
    }
};

Build.prototype.getStatus = function () {
    return this._status;
};

module.exports = Build;