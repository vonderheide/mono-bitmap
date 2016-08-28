"use strict";

const Canvas = require("../lib/Canvas");

// TODO: Better use a mock framework

module.exports = class CanvasSpy extends Canvas {
    constructor() {
        super(1, 1);
        this.reset();
    }

    reset() {
        this._getPixelCalled = null;
        this._setPixelCalled = null;
    }

    get getPixelCalled() {
        return this._getPixelCalled;
    }

    get setPixelCalled() {
        return this._setPixelCalled;
    }

    getPixel(x, y) {
        this._getPixelCalled = [x, y];
    }

    setPixel(x, y, value) {
        this._setPixelCalled = [x, y, value];
    }
};