/* eslint-env node, jasmine */
"use strict";

const bitmapManipulation = require("..");
const PlanarRGBCanvas = bitmapManipulation.canvas.PlanarRGB;

describe("Creation", function () {
    it("creates a Buffer sized to bytes per pixel * columns * rows * 3", function () {
        let image = new PlanarRGBCanvas(5, 10, 2);

        expect(image.data).toEqual(jasmine.any(Buffer));
        expect(image.data.length).toBe(5 * 10 * 2 * 3);
    });
});

describe("setPixel", function () {
    describe("with 1 byte per pixel", function () {
        it("sets three bytes in the data array", function () {
            let canvas = new PlanarRGBCanvas(3, 3, 1);
            canvas.setPixel(0, 0, [10, 20, 30]);
            expect(canvas.data[0]).toBe(10);
            expect(canvas.data[9]).toBe(20);
            expect(canvas.data[18]).toBe(30);

            canvas.setPixel(1, 2, [40, 50, 60]);
            expect(canvas.data[7]).toBe(40);
            expect(canvas.data[16]).toBe(50);
            expect(canvas.data[25]).toBe(60);
        });
    });

    describe("with 2 bytes per pixel", function () {
        it("sets the corresponding bytes in the data array", function () {
            let canvas = new PlanarRGBCanvas(3, 3, 2);
            canvas.setPixel(0, 0, [1000, 2000, 3000]);
            expect(canvas.data[0]).toBe(3);
            expect(canvas.data[1]).toBe(232);
            expect(canvas.data[18]).toBe(7);
            expect(canvas.data[19]).toBe(208);
            expect(canvas.data[36]).toBe(11);
            expect(canvas.data[37]).toBe(184);

            canvas.setPixel(1, 2, [1000, 2000, 3000]);
            expect(canvas.data[14]).toBe(3);
            expect(canvas.data[15]).toBe(232);
            expect(canvas.data[32]).toBe(7);
            expect(canvas.data[33]).toBe(208);
            expect(canvas.data[50]).toBe(11);
            expect(canvas.data[51]).toBe(184);
        });

        it("writes the pixel data in low-high order when set to little endian", function () {
            let canvas = new PlanarRGBCanvas(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
            canvas.setPixel(1, 2, [1000, 2000, 3000]);
            expect(canvas.data[14]).toBe(232);
            expect(canvas.data[15]).toBe(3);
            expect(canvas.data[32]).toBe(208);
            expect(canvas.data[33]).toBe(7);
            expect(canvas.data[50]).toBe(184);
            expect(canvas.data[51]).toBe(11);
        });
    });
});

describe("getPixel", function () {
    it("builds an RGB array from the correct bytes", function () {
        let canvas = new PlanarRGBCanvas(3, 3, 2);
        canvas.data[14] = 3;
        canvas.data[15] = 232;
        canvas.data[32] = 7;
        canvas.data[33] = 208;
        canvas.data[50] = 11;
        canvas.data[51] = 184;
        expect(canvas.getPixel(1, 2)).toEqual([1000, 2000, 3000]);
    });

    it("builds an RGB array from the correct bytes in little endian", function () {
        let canvas = new PlanarRGBCanvas(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
        canvas.data[14] = 232;
        canvas.data[15] = 3;
        canvas.data[32] = 208;
        canvas.data[33] = 7;
        canvas.data[50] = 184;
        canvas.data[51] = 11;
        expect(canvas.getPixel(1, 2)).toEqual([1000, 2000, 3000]);
    });
});
