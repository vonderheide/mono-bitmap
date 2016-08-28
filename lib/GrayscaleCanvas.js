"use strict";

const Canvas = require("./Canvas");
const Endianness = require("./Endianness");

module.exports = class GrayscaleCanvas extends Canvas {

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
        super(width, height);

        this._bytesPerPixel = bytesPerPixel;
        this._endianness = endianness;
        this._data = new Buffer(width * height * bytesPerPixel);
    }

    getPixel(x, y) {
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
            return null;
        }
        try {
            let readFunction = this._readFunction();
            return readFunction.call(this._data, (y * this._width + x) * this._bytesPerPixel);
        } catch (error) {
            return null;
        }
    }

    setPixel(x, y, value) {
        if (x >= 0 && x < this._width) {
            let writeFunction = this._writeFunction();
            writeFunction.call(this._data, value, (y * this._width + x) * this._bytesPerPixel, true);
        }
    }

    get data() {
        return this._data;
    }

    _readFunction() {
        switch (this._bytesPerPixel) {
            case 1:
                return Buffer.prototype.readUInt8;
            case 2:
                return this._endianness === Endianness.BIG ? Buffer.prototype.readUInt16BE : Buffer.prototype.readUInt16LE;
            case 4:
                return this._endianness === Endianness.BIG ? Buffer.prototype.readUInt32BE : Buffer.prototype.readUInt32LE;
        }
    }

    _writeFunction() {
        switch (this._bytesPerPixel) {
            case 1:
                return Buffer.prototype.writeUInt8;
            case 2:
                return this._endianness === Endianness.BIG ? Buffer.prototype.writeUInt16BE : Buffer.prototype.writeUInt16LE;
            case 4:
                return this._endianness === Endianness.BIG ? Buffer.prototype.writeUInt32BE : Buffer.prototype.writeUInt32LE;
        }
    }
};