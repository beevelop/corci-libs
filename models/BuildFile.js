/**
 * @name BuildFile
 * @fileoverview general BuildFile object
 */
var path = require('path');

function BuildFile(BRID, localpath, platform) {
    this._BRID = BRID;
    this._localpath = localpath;
    this._platform = platform || BuildFile.defaultPlatform;
}

BuildFile.defaultPlatform = 'file';

BuildFile.toPaths = function (bufis) {
    var filepaths = [];
    bufis.forEach(function (bufi) {
        filepaths.push(bufi.getLocalpath());
    });

    return filepaths;
};

BuildFile.prototype.getBRID = function () {
    return this._BRID;
};

BuildFile.prototype.getLocalpath = function () {
    return this._localpath;
};

BuildFile.prototype.updateLocalpath = function (localpath) {
    this._localpath = path.resolve(localpath);
};

BuildFile.prototype.getPlatform = function () {
    return this._platform;
};

BuildFile.prototype.getBasename = function () {
    return path.basename(this.getLocalpath());
};

module.exports = BuildFile;