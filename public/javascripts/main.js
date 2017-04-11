(function() {
    'use strict';
    //Setup canvas drawing handlers
    var canvas = document.getElementById('draw-canvas');
    var ctx = canvas.getContext('2d');
    var colorPicker = document.getElementById('color-picker');
    var isLeftClickActive = false;
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
        socket.emit('pixelData', { color, x, y });
    }

    var hexToRgb = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }


    var getCurrentColor = function(x, y) {
        var imageData = ctx.getImageData(x, y, 1, 1).data;
        return {
            r: imageData[0],
            g: imageData[1],
            b: imageData[2],
            a: imageData[3]
        };
    }

    var isOverwritingSameColor = function(currentColor, selectedColor) {
        if (currentColor.a === 0) {
            return false;
        }

        if (currentColor.r === selectedColor.r &&
            currentColor.g === selectedColor.g &&
            currentColor.b === selectedColor.b) {
            return true;
        }

        return false;
    }

    var drawPixelOnCanvas = function(color, x, y, shouldUpdate) {
        ctx.fillStyle = color;
        var bigX = x - (x % PIXEL_SIZE);
        var bigY = y - (y % PIXEL_SIZE);
        var currentColor = getCurrentColor(bigX, bigY);
        var selectedColor = hexToRgb(color);
        var isSameData = isOverwritingSameColor(currentColor, selectedColor);
        ctx.fillRect(bigX, bigY, PIXEL_SIZE, PIXEL_SIZE);
        if (shouldUpdate && !isSameData) {
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

    canvas.addEventListener('mousedown', function(evt) {
        if (evt.button === 2) {
            return;
        }
        isLeftClickActive = true;
    }, false);

    canvas.addEventListener('mouseup', function(evt) {
        if (evt.button === 2) {
            return;
        }
        isLeftClickActive = false;
    }, false);

    canvas.addEventListener('mousemove', function(evt) {
        if (isLeftClickActive) {
            var selectedColor = getSelectedColor();
            var mousePos = getMousePos(evt);
            drawPixelOnCanvas(selectedColor, mousePos.x, mousePos.y, true);
        }
    }, false);

    loadCoordinatesFromServer();
})();