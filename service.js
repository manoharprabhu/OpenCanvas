var service = (function() {
    var database = require('./database');
    var placePixel = function(color, x, y) {
        //TODO
        //Check color and coordinates validity
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