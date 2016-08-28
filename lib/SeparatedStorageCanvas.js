"use strict";

const Canvas = require("./Canvas");

module.exports = class SeparatedStorageCanvas extends Canvas {

    /**
     * A canvas that stores values with a fixed number of components (e.g. greyscale, RGB). The values for pixels are stored separated by plane, i.e.
     * R-R-R-G-G-G-B-B-B for RGB.
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
        this._data.fill(0);
    }

    getPixel(x, y) {
        if (!this.areCoordinatesValid(x, y)) {
            return null;
        }
        try {
            let readFunction = this._readFunction();
            let result = [];
            for (let component = 0; component < this._valuesPerPixel; ++component) {
                let offset = component * this._width * this._height * this._bytesPerPixel +
                    (y * this._width + x) * this._bytesPerPixel;
                result.push(readFunction.call(this._data, offset));
            }
            return result;
        } catch (error) {
            return null;
        }
    }

    setPixel(x, y, value) {
        if (this.areCoordinatesValid(x, y)) {
            let writeFunction = this._writeFunction();
            for (let component = 0; component < this._valuesPerPixel; ++component) {
                let offset = component * this._width * this._height * this._bytesPerPixel +
                    (y * this._width + x) * this._bytesPerPixel;
                writeFunction.call(this._data, value[component], offset, true);
            }
        }
    }
};