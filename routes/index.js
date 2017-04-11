var express = require('express');
var router = express.Router();
var service = require('../service');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/placePixel', function(req, res, next) {
    var color = parseInt(req.body.color),
        x = parseInt(req.body.x),
        y = parseInt(req.body.y);
    service.placePixel(color, x, y);
    res.end();
});

router.get('/getPixels', function(req, res, next) {
    service.getPixels(function(data) {
        res.json(data);
    });
});

module.exports = router;