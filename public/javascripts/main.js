(function() {
    'use strict';
    //Setup canvas drawing handlers
    var canvas = document.getElementById('draw-canvas');
    var ctx = canvas.getContext('2d');
    var colorPicker = document.getElementById('color-picker');
    var socket = io();
    const PIXEL_SIZE = 5;

    socket.on('connect', function() {
        console.log('Connected to socket...');
    });

    socket.on('pixel', function(data) {
        drawPixelOnCanvas(data.color, data.x, data.y, false);
    });

    var drawExistingCoordinates = function(data) {
        data.forEach(function(item) {
            drawPixelOnCanvas(item.color, item.x, item.y, false);
        });
    }

    var loadCoordinatesFromServer = function() {
        $.ajax({
            'type': 'GET',
            'url': '/getPixels',
            success: function(data) {
                drawExistingCoordinates(data);
            }
        });
    }

    var getMousePos = function(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    var getSelectedColor = function() {
        return colorPicker.value;
    }

    var sendCoordinatesToServer = function(color, x, y) {
        $.ajax({
            type: 'POST',
            url: '/placePixel',
            data: {
                color,
                x,
                y
            },
            success: function(data) {

            }
        });
    }

    var drawPixelOnCanvas = function(color, x, y, shouldUpdate) {
        ctx.fillStyle = color;
        var bigX = x - (x % PIXEL_SIZE);
        var bigY = y - (y % PIXEL_SIZE)
        ctx.fillRect(bigX, bigY, PIXEL_SIZE, PIXEL_SIZE);
        if (shouldUpdate) {
            sendCoordinatesToServer(color, bigX, bigY);
        }
    }

    canvas.addEventListener('click', function(evt) {
        if (evt.button === 2) {
            return;
        }
        var selectedColor = getSelectedColor();
        var mousePos = getMousePos(evt);
        drawPixelOnCanvas(selectedColor, mousePos.x, mousePos.y, true);
    }, false);

    loadCoordinatesFromServer();
})();