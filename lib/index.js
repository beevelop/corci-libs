// Extend arrays
require('array-sugar');
var stringformat = require('stringformat');
stringformat.extendString();

module.exports = {
    Common: require('./Common'),
    FileStream: require('./FileStream'),
    Logger: require('./Logger')
};