var service = (function() {
    var database = require('./database');
    var validateParameters = function(color, x, y) {
        if (/^#[0-9A-F]{6}$/i.test(color) === false) {
            return false;
        }
        if (x < 0 || x > 400) {
            return false;
        }
        if (y < 0 || y > 400) {
            return false;
        }
        return true;
    }
    var placePixel = function(color, x, y) {
        if (!validateParameters(color, x, y)) {
            return;
        }
        database.placePixel(color, x, y);
    }

    var getPixels = function(callback) {
        database.getPixels(callback);
    }

    return {
        getPixels,
        placePixel
    }
}());

module.exports = service;