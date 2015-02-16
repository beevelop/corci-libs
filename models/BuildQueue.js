var BuildStatus = require('./BuildStatus');

/**
 * Constructor of BuildQueue
 * @class
 */
function BuildQueue() {
    this._builds = [];
    this._targets = [];
    this._interval = null;
    this._timeout = 500;

    this.startProcessing();
}

BuildQueue.prototype.getSupportedPlatforms = function () {
    var platforms = [];
    this._targets.forEach(function (target) {
        platforms.push(target.getPlatform());
    });

    return platforms;
};

BuildQueue.prototype.addTarget = function (target) {
    this._targets.push(target);
};

BuildQueue.prototype.getTargets = function () {
    return this._targets;
};

BuildQueue.prototype.removeTarget = function (target) {
    this._targets.remove(target);
};

BuildQueue.prototype.getTimeout = function () {
    return this._timeout;
};

BuildQueue.prototype.setTimeout = function (timeout) {
    timeout = parseInt(timeout, 10);
    if (!isNaN(timeout)) {
        this._timeout = timeout;
    }
};

BuildQueue.prototype.add = function (build) {
    this._builds.push(build);
    build.setStatus(BuildStatus.queued);
};

BuildQueue.prototype.getBuild = function (BID) {
    return this._builds.findOne(function (build) {
        return build.getBID() === BID;
    });
};

BuildQueue.prototype.jump = function (build) {
    build.setStatus(BuildStatus.queued);
    this._builds.unshift(build);
};

BuildQueue.prototype.startProcessing = function () {
    if (this._interval) {
        clearInterval(this._interval);
    }
    this._interval = setInterval(this.assign.bind(this), this.getTimeout());
};

BuildQueue.prototype.pauseQueue = function () {
    clearInterval(this._interval);
};

BuildQueue.prototype.next = function () {
    return this._builds.shift();
};

BuildQueue.prototype.assign = function () {
    var build = this.next();
    if (build) {
        var unassigned = this.getTargets().every(function (target) {
            var canBuild = target.canBuild(build);
            if (canBuild) {
                target.transferBuild(build);
                return false;
            }
            return true;
        });
        if (unassigned) {
            this.jump(build);
        }
    }
};

module.exports = BuildQueue;