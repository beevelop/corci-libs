/**
 * @name Build
 * @fileoverview general Build object
 */

var Common = require('./../lib/Common');
var CircularJSON = Common.circularJSON;
var extend = Common.extend;
var fs = Common.fsExtra;

var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var statuses = ['unknown', 'cancelled', 'success', 'planned', 'queued', 'uploading', 'building', 'failed'];

/**
 * Constructor of Archiver
 * initialises archiver detection
 * @class
 *
 * @param {Object} conf    - object with the build's configuration
 * @param {Client} client  - the client the build comes frome
 * @param {Agent} agent    - the agent that executes the build
 * @param {Array} platform - platforms of the build
 * @param files
 * @param outputFiles
 * @param id
 * @param masterId
 * @returns {*}
 * @constructor
 */
function Build(conf, client, agent, platform, files, outputFiles, id, masterId) {
    if (arguments.length === 1) {
        return this.createFromObject(conf);
    }
    this.conf = extend(true, {}, conf);
    this.client = client;
    this.agent = agent;
    if (files) {
        this.files = files;
    }
    this.id = id || Common.getShortID();
    this.conf.platform = platform;
    this.conf.logs = conf.logs || [];
    if (masterId) {
        if (masterId.id) {
            this.master = masterId;
        }
        this.masterId = masterId && masterId.id || masterId;
    }
    if (outputFiles) {
        this.outputFiles = outputFiles;
    }
}

util.inherits(Build, EventEmitter);

Build.STATUS = require('./BuildStatus');

Build.prototype.createFromObject = function (conf) {
    var b = conf || {};
    var r = new Build(b.conf, b.client, b.agent, b.conf && b.conf.platform, b.files, b.outputFiles, b.id, b.masterId);
    if (Array.isArray(b.platforms)) {
        r.platforms = [];
        b.platforms.forEach(function(platformBuild) {
            var pb = new Build(platformBuild);
            pb.master = r;
            r.platforms.push(pb);
        });
    }
    return r;
};

Build.prototype.Id = function() {
    return this.conf.number || this.id;
};

Build.prototype.serialize = function(includeOptions, platformOptions) {
    var result = {
        conf: this.conf,
        id: this.id
    };
    if (this.masterId) {
        result.masterId = this.masterId;
    }
    if (includeOptions) {
        if (includeOptions.files) {
            result.files = (this.files || []).map(function(file) {
                var result = {file: file.file, group: file.group};
                if (includeOptions.content) {
                    result.content = file.content;
                }
                return result;
            });
        }
        if (includeOptions.outputFiles) {
            result.outputFiles = (this.outputFiles || []).map(function(file) {
                var result = {file: file.file};
                if (includeOptions.content) {
                    result.content = file.content;
                }
                return result;
            });
        }
        if (includeOptions.platforms) {
            //serialize individual build per platform
            if (this.platforms) {
                result.platforms = [];
                (this.platforms || []).forEach(function(platformBuild) {
                    result.platforms.push(platformBuild.serialize(platformOptions));
                });
            }
        }
    }
    return result;
};

Build.prototype.updateStatus = function(newStatus, location) {
    var save = this.conf.status !== newStatus;
    this.conf.status = newStatus;
    if (this.master) {
        var masterStatus = 0;
        this.master.platforms.forEach(function(child, i) {
            i = statuses.indexOf(child && child.conf && child.conf.status);
            if (i > masterStatus) {
                masterStatus = i;
            }
        });
        if (this.master.conf.status !== statuses[masterStatus]) {
            this.master.updateStatus(statuses[masterStatus], location);
        }
    } else {
        if (save) {
            var buildPath = path.resolve(location, this.Id(), 'build.json');
            this.save(buildPath);
        }
    }
};

Build.prototype.save = function(buildPath, callback) {
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
};

module.exports = Build;

// @todo: finish docs