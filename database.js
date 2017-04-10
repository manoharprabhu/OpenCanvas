var database = (function() {
    var Datastore = require('nedb'),
        db = new Datastore({ filename: 'pixels.db', autoload: true, inMemoryOnly: true });

    var placePixel = function(color, x, y) {
        db.findOne({ $and: [{ x: x }, { y: y }] }, function(err, doc) {
            if (doc) {
                db.update({ x: x, y: y }, { $set: { color: color } }, { multi: false }, function(err, num) {
                    if (err) console.log(err);
                });
            } else {
                db.insert({
                    color,
                    x,
                    y
                }, function(err) {
                    if (err) console.log(err);
                });
            }
        });
    }

    var getPixels = function(callback) {
        db.find({}, function(err, docs) {
            if (err) console.log(err);
            callback(docs);
        });
    }

    return {
        placePixel,
        getPixels
    }
}());

module.exports = database;