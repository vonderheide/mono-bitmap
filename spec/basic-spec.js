/* eslint-env node, jasmine */
"use strict";

const bitmapManipulation = require("../");

describe("Creation", function () {
    it("all pixels are initially zero", function () {
        let image = new bitmapManipulation.Bitmap(5, 10, 2);
        for (let x = 0; x < image.getWidth(); ++x) {
            for (let y = 0; y < image.getHeight(); ++y) {
                expect(image.getPixel(x, y)).toBe(0);
            }
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

describe("clear", function () {
    it("sets all pixel values to 0", function () {
        let image = new bitmapManipulation.Bitmap(3, 3, 2, bitmapManipulation.Endianness.LITTLE);
        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                image.setPixel(x, y, 65535);
            }
        }

        image.clear();

        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                let color = image.getPixel(x, y);
                expect(color).toBe(0);
            }
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
