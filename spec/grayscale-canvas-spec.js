/* eslint-env node, jasmine */
"use strict";

const bitmapManipulation = require("..");
const GrayscaleCanvas = bitmapManipulation.canvas.Grayscale;

describe("Creation", function () {
    it("creates a Buffer sized to bytes per pixel * columns * rows", function () {
        let image = new GrayscaleCanvas(5, 10, 2);

        expect(image.data).toEqual(jasmine.any(Buffer));
        expect(image.data.length).toBe(5 * 10 * 2);
    });
});

describe("setPixel", function () {
    describe("with 1 byte per pixel", function () {
        it("sets the corresponding byte in the data array", function () {
            let canvas = new GrayscaleCanvas(3, 3, 1);
            canvas.setPixel(0, 0, 255);
            expect(canvas.data[0]).toBe(255);

            canvas.setPixel(1, 2, 100);
            expect(canvas.data[7]).toBe(100);
        });
    });

    describe("with 2 bytes per pixel", function () {
        it("sets the corresponding bytes in the data array", function () {
            let canvas = new GrayscaleCanvas(3, 3, 2);
            canvas.setPixel(0, 0, 65535);
            expect(canvas.data[0]).toBe(255);
            expect(canvas.data[1]).toBe(255);

            canvas.setPixel(1, 2, 65535);
            expect(canvas.data[14]).toBe(255);
            expect(canvas.data[15]).toBe(255);
        });

        describe("endianness", function () {
            it("writes the pixel data in high-low order when set to big endian", function () {
                let canvas = new GrayscaleCanvas(3, 3, 2, bitmapManipulation.Endianness.BIG);
                canvas.setPixel(0, 0, 258);
                expect(canvas.data[0]).toBe(1);
                expect(canvas.data[1]).toBe(2);
            });

            it("writes the pixel data in low-high order when set to little endian", function () {
                let canvas = new GrayscaleCanvas(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
                canvas.setPixel(0, 0, 258);
                expect(canvas.data[0]).toBe(2);
                expect(canvas.data[1]).toBe(1);
            });
        });
    });
});
