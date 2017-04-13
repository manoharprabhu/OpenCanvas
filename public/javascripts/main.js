(function() {
    'use strict';
    var colorCode = ['black', 'white', 'red', 'orange', 'cyan', 'green', 'blue', 'grey'];
    var hexCode = [{ r: 0, g: 0, b: 0 },
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 0, b: 0 },
            { r: 255, g: 165, b: 0 },
            { r: 0, g: 255, b: 255 },
            { r: 0, g: 255, b: 0 },
            { r: 0, g: 0, b: 255 },
            { r: 128, g: 128, b: 128 },
        ]
        //Setup canvas drawing handlers
    var canvas = document.getElementById('draw-canvas');
    var ctx = canvas.getContext('2d');
    var isLeftClickActive = false;
    var socket = io();
    const PIXEL_SIZE = 5;
    const CANVAS_SIZE = 2000;

    socket.on('connect', function() {
        console.log('Connected to socket...');
    });

    socket.on('px', function(data) {
        drawPixelOnCanvas(data.color, data.x, data.y, false);
    });

    socket.on('userCount', function(data) {
        document.getElementById('user-count').innerText = data;
    });

    var drawExistingCoordinates = function(data) {
        data.forEach(function(item) {
            drawPixelOnCanvas(item.d[2], item.d[0], item.d[1], false);
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

    var drawGrid = function() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#CDCDCD";
        for (var i = 0; i < CANVAS_SIZE; i = i + PIXEL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, CANVAS_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(CANVAS_SIZE, i);
            ctx.stroke();
        }
    }

    var getMousePos = function(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    var getSelectedColor = function() {
        return document.querySelector('input[name="sel-color"]:checked').value
    }

    var sendCoordinatesToServer = function(color, x, y) {
        socket.emit('pd', { color, x, y });
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
        ctx.fillStyle = colorCode[color];
        var bigX = x - (x % PIXEL_SIZE);
        var bigY = y - (y % PIXEL_SIZE);
        var currentColor = getCurrentColor(bigX, bigY);
        var selectedColor = hexCode[color];
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

    document.getElementById('download-image').addEventListener('click', function() {
        var data = canvas.toDataURL('image/png');
        data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B');
        this.setAttribute('download', 'art.bmp');
        this.setAttribute('href', data);
    }, false);

    loadCoordinatesFromServer();
    drawGrid();
})();