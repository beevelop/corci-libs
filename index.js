var path = require('path');
var subfolder = path.resolve(__dirname, 'lib/');

module.exports = {};
require('fs').readdirSync(subfolder).forEach(function(file) {
    if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
        var name = file.replace('.js', '');
        var lib = path.resolve(subfolder, file);
        module.exports[name] = require(lib);
    }
});