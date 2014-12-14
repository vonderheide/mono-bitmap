/* eslint-env node, jasmine */
"use strict";

var MonochromeBitmapImage = require("../");

describe("Creation", function () {
    it("creates a Buffer sized to bytes per pixel * columns * rows", function () {
        var image = new MonochromeBitmapImage(5, 10, 2);

        expect(image.data()).toEqual(jasmine.any(Buffer));
        expect(image.data().length).toBe(5 * 10 * 2);
    });

    it("throws an exception when called with invalid bytes per pixel", function () {
        var create = function (bytesPerPixel) {
            return new MonochromeBitmapImage(1, 1, bytesPerPixel);
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
            var image = new MonochromeBitmapImage(3, 3, 1);
            image.setPixel(0, 0, 255);
            expect(image.data()[0]).toBe(255);

            image.setPixel(1, 2, 100);
            expect(image.data()[7]).toBe(100);
        });
    });

    describe("with 2 bytes per pixel", function () {
        it("sets the corresponding bytes in the data array", function () {
            var image = new MonochromeBitmapImage(3, 3, 2);
            image.setPixel(0, 0, 65535);
            expect(image.data()[0]).toBe(255);
            expect(image.data()[1]).toBe(255);

            image.setPixel(1, 2, 65535);
            expect(image.data()[14]).toBe(255);
            expect(image.data()[15]).toBe(255);
        });

        describe("endianness", function () {
            it("writes the pixel data in high-low order when set to big endian", function () {
                var image = new MonochromeBitmapImage(3, 3, 2, MonochromeBitmapImage.Endian.BIG);
                image.setPixel(0, 0, 258);
                expect(image.data()[0]).toBe(1);
                expect(image.data()[1]).toBe(2);
            });

            it("writes the pixel data in low-high order when set to little endian", function () {
                var image = new MonochromeBitmapImage(3, 3, 2, MonochromeBitmapImage.Endian.LITTLE);
                image.setPixel(0, 0, 258);
                expect(image.data()[0]).toBe(2);
                expect(image.data()[1]).toBe(1);
            });
        });
    });
});

describe("clear", function () {
    it("sets all pixel values to 0", function () {
        var image = new MonochromeBitmapImage(3, 3, 2, MonochromeBitmapImage.LITTLE_ENDIAN);
        for (var x = 0; x < 3; ++x) {
            for (var y = 0; y < 3; ++y) {
                image.setPixel(x, y, 65535);
            }
        }

        image.clear();

        for (var i = 0; i < image.data.length; ++i) {
            expect(image.data()[i]).toBe(0);
        }
    });
});
