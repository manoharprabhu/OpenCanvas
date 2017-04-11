var service = (function() {
    var database = require('./database');
    var validateParameters = function(color, x, y) {
        if (color < 0 || color > 7) {
            return false;
        }
        if (x < 0 || x > 2000) {
            return false;
        }
        if (y < 0 || y > 2000) {
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