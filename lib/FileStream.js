/**
 * @name FileStream
 * @version 0.1.0
 * @fileoverview provides the ability to stream files over socket.io via socket.io-stream
 */

var ProgressBar = require('progress');
var progress = require('progress-stream');
var Common = require('./Common');
var ios = Common.socket.stream;
var fs = Common.fsExtra;
var P = Common.Promise;

var path = require('path');

/**
 * @class
 */
function FileStream() {
}

/**
 * Converts a stream into a promise
 */
FileStream.stream2Promise = function (stream) {
    return new P(function (resolve, reject) {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
};

FileStream.sendAll = function (ioc, iopath, files, args) {
    var cArgs = Array.prototype.slice.call(arguments, 3);

    var streams = [];
    P.resolve(files).map(function (file) {
        var args = [ioc, iopath, file];
        args.push.apply(args, cArgs);
        var stream = FileStream.send.apply(FileStream, args);
        streams.push(stream);
    });

    return P.all(streams);
};

/**
 * Emits the files over socket.io (ioc) to the specified iopath
 */
FileStream.send = function (ioc, iopath, file, args) {
    var localpath = path.resolve(file);
    var cArgs = Array.prototype.slice.call(arguments, 3);

    return fs.statAsync(localpath).then(function (stats) {
        var stream = ios.createStream();

        // Emit the stream
        var meta = {
            localpath: localpath,
            basename: path.basename(localpath),
            stats: stats
        };

        var iostream = ios(ioc);
        var args = [iopath, stream, meta];
        args.push.apply(args, cArgs);
        iostream.emit.apply(iostream, args);

        var bar = new ProgressBar('Uploading [:bar] :percent :etas (' + meta.basename + ')', {
            complete: '=',
            incomplete: ' ',
            width: 42,
            total: stats.size
        });

        var str = progress({
            time: 500,
            length: stats.size
        }, function (progress) {
            bar.tick(progress.transferred);
        });

        // Start reading and pipe it through stream
        fs.createReadStream(localpath).pipe(str).pipe(stream);

        // Return the stream as a promise
        return FileStream.stream2Promise(stream);
    });
};

/**
 * Save the stream to localpath
 */
FileStream.save = function (stream, localpath, progressHandler) {
    var str = progress({time: 500}, function (progress) {
        if (progressHandler) {
            progressHandler(progress);
        }
    });

    return fs.ensureFileAsync(localpath).then(function () {
        stream.pipe(str).pipe(fs.createWriteStream(localpath));
        return FileStream.stream2Promise(stream);
    });
};

module.exports = FileStream;