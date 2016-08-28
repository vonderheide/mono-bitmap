"use strict";

const Canvas = require("./Canvas");

module.exports = class ConsecutiveStorageCanvas extends Canvas {

    /**
     * A canvas that stores values with a fixed number of components (e.g. greyscale, RGB). The values for a single pixel are stored consecutively, i.e.
     * R-G-B-R-G-B-... for RGB.
     *
     * The pixel value must be an array with the exact number of elements of that pixel.
     *
     * @class
     * @param {number} width
     * @param {number} height
     * @param {number} valuesPerPixel Number of values for a single pixel
     * @param {number} bytesPerPixel Possible values: <code>1</code>, <code>2</code>,
     *                                    <code>4</code>
     * @param {Endianness} endianness Use big- or little-endian when storing multiple bytes per
     *                                      pixel
     */
    constructor(width, height, valuesPerPixel, bytesPerPixel, endianness) {
        super(width, height, bytesPerPixel, endianness);

        this._valuesPerPixel = valuesPerPixel;
        this._data = new Buffer(width * height * bytesPerPixel * valuesPerPixel);
    }

    getPixel(x, y) {
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
            return null;
        }
        try {
            let readFunction = this._readFunction();
            let offset = (y * this._width + x) * this._bytesPerPixel * this._valuesPerPixel;
            let result = [];
            for (let component = 0; component < this._valuesPerPixel; ++component) {
                result.push(readFunction.call(this._data, offset));
                offset += this._bytesPerPixel;
            }
            return result;
        } catch (error) {
            return null;
        }
    }

    setPixel(x, y, value) {
        if (x >= 0 && x < this._width) {
            let writeFunction = this._writeFunction();
            let offset = (y * this._width + x) * this._bytesPerPixel * this._valuesPerPixel;
            for (let component = 0; component < this._valuesPerPixel; ++component) {
                writeFunction.call(this._data, value[component], offset, true);
                offset += this._bytesPerPixel;
            }
        }
    }
};