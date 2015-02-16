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
 * Constructor of FileStream
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
    })
};

/**
 * Emits the files over socket.io (ioc) to the specified iopath
 */
FileStream.send = function (ioc, iopath, file, meta, progressHandler) {
    var localpath = path.resolve(file);

    return fs.statAsync(localpath).then(function (stats) {
        var stream = ios.createStream();

        // Emit the stream
        ios(ioc).emit(iopath, stream, meta || null);

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
            if (progressHandler) {
                progressHandler(progress);
            }
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

    stream.pipe(str).pipe(fs.createWriteStream(localpath));
    return FileStream.stream2Promise(stream);
};

module.exports = FileStream;