/* eslint-env node, jasmine */
"use strict";

const RGBCanvas = require("../lib/canvas/RGBCanvas");
const bitmapManipulation = require("..");

describe("Creation", function () {
    it("creates a Buffer sized to bytes per pixel * columns * rows * 3", function () {
        let image = new RGBCanvas(5, 10, 2);

        expect(image.data).toEqual(jasmine.any(Buffer));
        expect(image.data.length).toBe(5 * 10 * 2 * 3);
    });
});

describe("setPixel", function () {
    describe("with 1 byte per pixel", function () {
        it("sets three bytes in the data array", function () {
            let canvas = new RGBCanvas(3, 3, 1);
            canvas.setPixel(0, 0, [10, 20, 30]);
            expect(canvas.data[0]).toBe(10);
            expect(canvas.data[1]).toBe(20);
            expect(canvas.data[2]).toBe(30);

            canvas.setPixel(1, 2, [40, 50, 60]);
            expect(canvas.data[21]).toBe(40);
            expect(canvas.data[22]).toBe(50);
            expect(canvas.data[23]).toBe(60);
        });
    });

    describe("with 2 bytes per pixel", function () {
        it("sets the corresponding bytes in the data array", function () {
            let canvas = new RGBCanvas(3, 3, 2);
            canvas.setPixel(0, 0, [1000, 2000, 3000]);
            expect(canvas.data[0]).toBe(3);
            expect(canvas.data[1]).toBe(232);
            expect(canvas.data[2]).toBe(7);
            expect(canvas.data[3]).toBe(208);
            expect(canvas.data[4]).toBe(11);
            expect(canvas.data[5]).toBe(184);

            canvas.setPixel(1, 2, [1000, 2000, 3000]);
            expect(canvas.data[42]).toBe(3);
            expect(canvas.data[43]).toBe(232);
            expect(canvas.data[44]).toBe(7);
            expect(canvas.data[45]).toBe(208);
            expect(canvas.data[46]).toBe(11);
            expect(canvas.data[47]).toBe(184);
        });

        it("writes the pixel data in low-high order when set to little endian", function () {
            let canvas = new RGBCanvas(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
            canvas.setPixel(1, 2, [1000, 2000, 3000]);
            expect(canvas.data[42]).toBe(232);
            expect(canvas.data[43]).toBe(3);
            expect(canvas.data[44]).toBe(208);
            expect(canvas.data[45]).toBe(7);
            expect(canvas.data[46]).toBe(184);
            expect(canvas.data[47]).toBe(11);
        });
    });
});

describe("getPixel", function () {
    it("builds an RGB array from the correct bytes", function () {
        let canvas = new RGBCanvas(3, 3, 2);
        canvas.data[42] = 3;
        canvas.data[43] = 232;
        canvas.data[44] = 7;
        canvas.data[45] = 208;
        canvas.data[46] = 11;
        canvas.data[47] = 184;
        expect(canvas.getPixel(1, 2)).toEqual([1000, 2000, 3000]);
    });

    it("builds an RGB array from the correct bytes in little endian", function () {
        let canvas = new RGBCanvas(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
        canvas.data[42] = 232;
        canvas.data[43] = 3;
        canvas.data[44] = 208;
        canvas.data[45] = 7;
        canvas.data[46] = 184;
        canvas.data[47] = 11;
        expect(canvas.getPixel(1, 2)).toEqual([1000, 2000, 3000]);
    });
});
