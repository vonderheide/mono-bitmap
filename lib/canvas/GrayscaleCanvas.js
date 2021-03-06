"use strict";

const ConsecutiveStorageCanvas = require("./InterleavedStorageCanvas");

module.exports = class GrayscaleCanvas extends ConsecutiveStorageCanvas {

    /**
     * @class
     * @param {number} width
     * @param {number} height
     * @param {number} bytesPerPixel Possible values: <code>1</code>, <code>2</code>,
     *                                    <code>4</code>
     * @param {Endianness} endianness Use big- or little-endian when storing multiple bytes per
     *                                      pixel
     */
    constructor(width, height, bytesPerPixel, endianness) {
        super(width, height, 1, bytesPerPixel, endianness);
    }

    getPixel(x, y) {
        let result = super.getPixel(x, y);
        return result ? result[0] : null;
    }

    setPixel(x, y, value) {
        super.setPixel(x, y, [value]);
    }
};
