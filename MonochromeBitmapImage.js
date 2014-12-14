"use strict";

module.exports = MonochromeBitmapImage;

/**
 * @enum
 */
MonochromeBitmapImage.Endian = {
    BIG: "BE",
    LITTLE: "LE"
};

/**
 * Creates an in-memory greyscale bitmap image.
 *
 * @constructor
 * @param {int} columns number of columns (pixels in x direction)
 * @param {int} rows number of rows (pixels in y direction)
 * @param {int} bytesPerPixel bytes used per pixel (1, 2 or 4)
 * @param {Endian} endianess use big- or little-endian to store multiple bytes per pixel
 */
function MonochromeBitmapImage(columns, rows, bytesPerPixel, endianess) {

    checkForValidBytesPerPixel(bytesPerPixel);

    endianess = endianess || MonochromeBitmapImage.Endian.BIG;
    var writeFunction = getWriteFunction(bytesPerPixel, endianess);
    var data = new Buffer(columns * rows * bytesPerPixel);

    /**
     * Returns the byte data of this image.
     *
     * @returns {Buffer}
     */
    this.data = function () {
        return data;
    };

    /**
     * Sets the pixel at the given coordinates to a greyscale value.
     *
     * @param {int} x x coordinate
     * @param {int} y y coordinate
     * @param {int} value greyscale value
     */
    this.setPixel = function (x, y, value) {
        var offset = (x + y * columns) * bytesPerPixel;
        writeFunction.call(data, value, offset);
    };

    /**
     * Sets all pixel values to 0.
     */
    this.clear = function () {
        data.fill(0);
    };

    /**
     * Draws a filled rectangle with a border
     * @param {int} left starting x coordinate
     * @param {int} top starting y coordinate
     * @param {int} width width of the rectangle
     * @param {int} height height of the rectangle
     * @param {int} borderValue greyscale color of the (one pixel) border
     * @param {int} fillValue greyscale color to fill the rectangle with
     */
    this.drawFilledRect = function (left, top, width, height, borderValue, fillValue) {
        for (var x = left; x < left + width; ++x) {
            for (var y = top; y < top + height; ++y) {
                var value = fillValue;
                if (x === left || x === left + width - 1 || y === top || y === top + height - 1) {
                    value = borderValue;
                }
                this.setPixel(x, y, value);
            }
        }
    };

    /**
     * Draws a rectangle filled with a horizontal gradient.
     *
     * @param {int} left starting x coordinate
     * @param {int} top starting y coordinate
     * @param {int} width width of the rectangle
     * @param {int} height height of the rectangle
     * @param {int} fromValue greyscale color of the leftmost pixel
     * @param {int} toValue greyscale color of the rightmost pixel
     */
    this.drawGradientRect = function (left, top, width, height, fromValue, toValue) {
        for (var x = left; x < left + width; ++x) {
            var value = calculateGradientValue(x - left, width, fromValue, toValue);
            for (var y = top; y < top + height; ++y) {
                this.setPixel(x, y, value);
            }
        }
    };

    function calculateGradientValue(step, numSteps, fromValue, toValue) {
        if (step === 0) {
            return fromValue;
        }
        if (step === numSteps - 1) {
            return toValue;
        }
        var changePerStep = (toValue - fromValue + .5) / numSteps;
        return Math.round(step * changePerStep) + fromValue;
    }

    function isBigEndian() {
        return endianess === MonochromeBitmapImage.Endian.BIG;
    }

    function getWriteFunction() {
        switch (bytesPerPixel) {
            case 1:
                return Buffer.prototype.writeUInt8;
            case 2:
                return isBigEndian() ? Buffer.prototype.writeUInt16BE : Buffer.prototype.writeUInt16LE;
            case 4:
                return isBigEndian() ? Buffer.prototype.writeUInt32BE : Buffer.prototype.writeUInt32LE;
        }
    }

    function checkForValidBytesPerPixel() {
        if (bytesPerPixel !== 1 && bytesPerPixel !== 2 && bytesPerPixel !== 4) {
            throw "Bytes per pixel must be 1, 2 or 4";
        }
    }

    this.clear();
}
