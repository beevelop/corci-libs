var stringformat = require('stringformat');

require('date-format-lite');
require('array-sugar');

stringformat.extendString();

var class2type = [];
"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function (name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
});
Object.every = function (obj, callback, context) {
    var value,
        i = 0,
        length = obj.length,
        type = obj === null ? String(obj) : typeof obj === "object" || typeof obj === "function" ? class2type[class2type.toString.call(obj)] || "object" : typeof obj,
        isArray = type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);

    if (context) {
        if (isArray) {
            obj.every(callback, context);
        } else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    value = callback.call(context, obj[i], i, obj);
                    if (value === false) {
                        return false;
                    }
                }
            }
        }
    } else {
        if (isArray) {
            obj.every(callback, obj);
        } else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    value = callback.call(obj, i, obj[i], i, obj);
                    if (value === false) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
};