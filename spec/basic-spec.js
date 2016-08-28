/* eslint-env node, jasmine */
"use strict";

const bitmapManipulation = require("../");

describe("Creation", function () {
    it("creates a Buffer sized to bytes per pixel * columns * rows", function () {
        let image = new bitmapManipulation.Bitmap(5, 10, 2);

        expect(image.data()).toEqual(jasmine.any(Buffer));
        expect(image.data().length).toBe(5 * 10 * 2);
    });

    it("all pixels are initially zero", function () {
        let image = new bitmapManipulation.Bitmap(5, 10, 2);
        let data = image.data();
        for (let i = 0; i < data.length; i++) {
            expect(data[i]).toBe(0);
        }
    });

    it("throws an exception when called with invalid bytes per pixel", function () {
        const create = function (bytesPerPixel) {
            return new bitmapManipulation.Bitmap(1, 1, bytesPerPixel);
        };
        expect(create.bind(null, "foo")).toThrow();
        expect(create.bind(null, 0)).toThrow();
        expect(create.bind(null, 6)).toThrow();
        expect(create.bind(null, 3)).toThrow();
    });
});

describe("setPixel", function () {
    describe("with 1 byte per pixel", function () {
        it("sets the corresponding byte in the data array", function () {
            let image = new bitmapManipulation.Bitmap(3, 3, 1);
            image.setPixel(0, 0, 255);
            expect(image.data()[0]).toBe(255);

            image.setPixel(1, 2, 100);
            expect(image.data()[7]).toBe(100);
        });
    });

    describe("with 2 bytes per pixel", function () {
        it("sets the corresponding bytes in the data array", function () {
            let image = new bitmapManipulation.Bitmap(3, 3, 2);
            image.setPixel(0, 0, 65535);
            expect(image.data()[0]).toBe(255);
            expect(image.data()[1]).toBe(255);

            image.setPixel(1, 2, 65535);
            expect(image.data()[14]).toBe(255);
            expect(image.data()[15]).toBe(255);
        });

        describe("endianness", function () {
            it("writes the pixel data in high-low order when set to big endian", function () {
                let image = new bitmapManipulation.Bitmap(3, 3, 2, bitmapManipulation.Endianness.BIG);
                image.setPixel(0, 0, 258);
                expect(image.data()[0]).toBe(1);
                expect(image.data()[1]).toBe(2);
            });

            it("writes the pixel data in low-high order when set to little endian", function () {
                let image = new bitmapManipulation.Bitmap(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
                image.setPixel(0, 0, 258);
                expect(image.data()[0]).toBe(2);
                expect(image.data()[1]).toBe(1);
            });
        });
    });
});

describe("clear", function () {
    it("sets all pixel values to 0", function () {
        let image = new bitmapManipulation.Bitmap(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                image.setPixel(x, y, 65535);
            }
        }

        image.clear();

        let pixels = image.data();
        for (let i = 0; i < pixels.length; ++i) {
            expect(pixels[i]).toBe(0);
        }
    });
});

describe("replaceColor", function () {
    it("sets all pixel values of the given color to a new one, without changing any other pixels", function () {
        let image = new bitmapManipulation.Bitmap(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                image.setPixel(x, y, y);
            }
        }

        image.replaceColor(2, 4);

        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                let color = image.getPixel(x, y);
                expect(color).toBe(y === 2 ? 4 : y);
            }
        }
    });
});
