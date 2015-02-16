/**
 * @name BuildRequest
 * @version 0.1.0
 * @fileoverview general BuildRequest object
 */

var Build = require('./Build');
var BuildFile = require('./BuildFile');
var Common = require('./../lib/Common');
var CircularJSON = Common.circularJSON;
var fs = Common.fsExtra;

var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Constructor of BuildRequest
 * @class
 */
function BuildRequest(BRID, platforms, client) {
    this._BRID = BRID || Common.getShortID();
    this._status = BuildRequest.STATUS.unknown;
    this._builds = [];
    this._artifacts = [];

    this._timing = {};

    this._client = client;

    this.timer('start');

    // add Build for each platform
    platforms.forEach(this.addBuild.bind(this));
}

util.inherits(BuildRequest, EventEmitter);

BuildRequest.STATUS = require('./BuildRequestStatus');

BuildRequest.prototype.getBRID = function () {
    return this._BRID;
};

BuildRequest.prototype.setStatus = function (status) {
    this._status = BuildRequest.STATUS[status] || BuildRequest.STATUS['unknown'];
    if (this._status.inherits === true) {
        var statusValue = this._status.value;
        this._builds.forEach(function (build) {
            build.setStatus(Build.STATUS[statusValue]);
        })
    }
    this.emit('status', this, this._status);
};

BuildRequest.prototype.getStatus = function () {
    return BuildRequest.STATUS[this._status];
};

BuildRequest.prototype.addBuild = function (platform) {
    var build = new Build(this.getBRID(), this.getClient(), platform);
    build.on('status', function (status) {
        //@todo: check status and update breq status
        console.log('Build ' + build.getBID() + ' has a new status: ' + status);
    });
    this._builds.push(build);
};

BuildRequest.prototype.getBuilds = function () {
    return this._builds;
};

BuildRequest.prototype.getBuild = function (BID) {
    return this._builds.findOne(function (build) {
        return build.getBID() === BID;
    });
};

BuildRequest.prototype.getBuildsByPlatform = function (platform) {
    return this._builds.filter(function (build) {
        return build.getPlatform() === platform;
    });
};

BuildRequest.prototype.getPlatforms = function () {
    var platforms = [];
    this._builds.forEach(function (build) {
        platforms.push(build.getPlatform())
    });

    return platforms;
};

BuildRequest.prototype.timer = function (entry, time) {
    this._timing[entry] = time || Date.now();
};

BuildRequest.prototype.getTiming = function (entry) {
    return this._timing[entry];
};

BuildRequest.prototype.getClient = function () {
    return this._client;
};

BuildRequest.prototype.addBuildFile = function (bufi) {
    var builds = this.getBuilds();
    if (bufi !== BuildFile.defaultPlatform) {
        builds = builds.filter(function (build) {
            return build.getPlatform() === bufi.getPlatform();
        });
    }

    builds.forEach(function (build) {
        build.addBuildFile(bufi);
    });
};

BuildRequest.prototype.getArtifacts = function () {
    return this._artifacts;
};

BuildRequest.prototype.addArtifact = function (artifact) {
    this._artifacts.push(artifact);
};

BuildRequest.prototype.toString = function () {
    //@todo: only allowed attributes (whitelist?)
    return CircularJSON.stringify(this);
};

BuildRequest.prototype.save = function (folder) {
    var localpath = path.resolve(folder, 'breq.json');
    return fs.outputFileAsync(localpath, this.toString());
};

module.exports = BuildRequest;