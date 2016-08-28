"use strict";

module.exports = class Canvas {
    constructor(width, height) {
        this._width = width;
        this._height = height;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    getPixel(x, y) {
        throw "Not implemented";
    }

    setPixel(x, y, value) {
        throw "Not implemented";
    }

    get data() {
        throw "Not implemented";
    }
};
