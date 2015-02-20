/**
 * @name BuildRequest
 * @fileoverview general BuildRequest object
 */

var Build = require('./Build');
var BuildFile = require('./BuildFile');
var BuildRequestStatus = require('./BuildRequestStatus');
var Common = require('./../lib/Common');

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
    if (this._status !== status) {
        if (this._status.inherits === true) {
            var statusValue = this._status.value;
            this._builds.forEach(function (build) {
                build.setStatus(Build.STATUS[statusValue]);
            })
        }
        this._status = status;
        this.emit('status', this, this._status);
    }
};

BuildRequest.prototype.getStatus = function () {
    return BuildRequest.STATUS[this._status];
};

BuildRequest.prototype.addBuild = function (platform) {
    var build = new Build(this.getBRID(), this.getClient(), platform);
    var _this = this;
    build.on('status', function (status) {
        if (_this.allBuildsFinished()) {
            _this.setStatus(BuildRequestStatus.finished);
        }
        _this.emit('build', build.getBID(), status);
    });
    this._builds.push(build);
};

BuildRequest.prototype.getBuilds = function () {
    return this._builds;
};

BuildRequest.prototype.allBuildsFinished = function () {
    return this.getBuilds().every(function (build) {
        return build.getStatus().finished;
    });
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
    if (bufi.getPlatform() !== BuildFile.defaultPlatform) {
        builds = builds.filter(function (build) {
            return build.getPlatform() === bufi.getPlatform();
        });
    }

    builds.forEach(function (build) {
        build.addBuildFile(bufi);
    });
};

BuildRequest.prototype.getArtifacts = function () {
    var builds = this.getBuilds();
    var artifacts = [];
    builds.forEach(function (build) {
        artifacts.push.apply(artifacts, build.getArtifacts());
    });

    return artifacts;
};

module.exports = BuildRequest;