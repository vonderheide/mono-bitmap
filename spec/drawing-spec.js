/* eslint-env node, jasmine */
"use strict";

const bitmapManipulation = require("../");
const image = new bitmapManipulation.Bitmap(20, 20, 1);
const FOREGROUND = 10;
const BACKGROUND = 100;

describe("Drawing", function () {

    beforeEach(function () {
        image.clear();
        spyOn(image, "setPixel");
    });

    describe("a filled rectangle", function () {
        beforeEach(function () {
            image.drawFilledRect(1, 1, 3, 3, FOREGROUND, BACKGROUND);
        });

        it("sets the rectangle border to the border value", function () {
            expect(image.setPixel).toHaveBeenCalledWith(1, 1, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(2, 1, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(3, 1, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(1, 2, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(3, 2, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(1, 3, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(2, 3, FOREGROUND);
            expect(image.setPixel).toHaveBeenCalledWith(3, 3, FOREGROUND);
        });

        it("fills the rectangle with the fill value", function () {
            expect(image.setPixel).toHaveBeenCalledWith(2, 2, BACKGROUND);
        });
    });

    describe("a gradient rectangle", function () {

        describe("when the number of gradient steps in the rectangle matches its width", function () {
            beforeEach(function () {
                image.drawGradientRect(1, 5, 10, 1, 1, 10);
            });

            it("the first pixel has the start value", function () {
                expect(image.setPixel).toHaveBeenCalledWith(1, 5, 1);
            });

            it("the last pixel has the end value", function () {
                expect(image.setPixel).toHaveBeenCalledWith(10, 5, 10);
            });

            it("each intermediate pixel's value is one higher than the last one", function () {
                expect(image.setPixel).toHaveBeenCalledWith(2, 5, 2);
                expect(image.setPixel).toHaveBeenCalledWith(3, 5, 3);
                expect(image.setPixel).toHaveBeenCalledWith(4, 5, 4);
                expect(image.setPixel).toHaveBeenCalledWith(5, 5, 5);
                expect(image.setPixel).toHaveBeenCalledWith(6, 5, 6);
                expect(image.setPixel).toHaveBeenCalledWith(7, 5, 7);
                expect(image.setPixel).toHaveBeenCalledWith(8, 5, 8);
                expect(image.setPixel).toHaveBeenCalledWith(9, 5, 9);

            });
        });

        describe("when the number of gradient steps is smaller than its width", function () {
            beforeEach(function () {
                image.drawGradientRect(1, 5, 10, 1, 1, 5);
            });

            it("the first pixel has the start value", function () {
                expect(image.setPixel).toHaveBeenCalledWith(1, 5, 1);
            });

            it("the last pixel has the end value", function () {
                expect(image.setPixel).toHaveBeenCalledWith(10, 5, 5);
            });

            it("the intermediate gradient steps are distributed over the intermediate pixels", function () {
                expect(image.setPixel).toHaveBeenCalledWith(2, 5, 1);
                expect(image.setPixel).toHaveBeenCalledWith(3, 5, 2);
                expect(image.setPixel).toHaveBeenCalledWith(4, 5, 2);
                expect(image.setPixel).toHaveBeenCalledWith(5, 5, 3);
                expect(image.setPixel).toHaveBeenCalledWith(6, 5, 3);
                expect(image.setPixel).toHaveBeenCalledWith(7, 5, 4);
                expect(image.setPixel).toHaveBeenCalledWith(8, 5, 4);
                expect(image.setPixel).toHaveBeenCalledWith(9, 5, 5);

            });
        });

        describe("when the number of gradient steps is larger than its width", function () {
            beforeEach(function () {
                image.drawGradientRect(1, 5, 10, 1, 1, 15);
            });

            it("the first pixel has the start value", function () {
                expect(image.setPixel).toHaveBeenCalledWith(1, 5, 1);
            });

            it("the last pixel has the end value", function () {
                expect(image.setPixel).toHaveBeenCalledWith(10, 5, 15);
            });

            it("some gradient steps are skipped", function () {
                expect(image.setPixel).toHaveBeenCalledWith(2, 5, 2);
                expect(image.setPixel).toHaveBeenCalledWith(3, 5, 4);
                expect(image.setPixel).toHaveBeenCalledWith(4, 5, 5);
                expect(image.setPixel).toHaveBeenCalledWith(5, 5, 7);
                expect(image.setPixel).toHaveBeenCalledWith(6, 5, 8);
                expect(image.setPixel).toHaveBeenCalledWith(7, 5, 10);
                expect(image.setPixel).toHaveBeenCalledWith(8, 5, 11);
                expect(image.setPixel).toHaveBeenCalledWith(9, 5, 13);
            });
        });
    });
});
