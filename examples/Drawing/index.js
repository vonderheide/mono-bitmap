"use strict";

const bitmapManipulation = require("../../");

let targetColorDepth = 4;

// Create bitmap with 1 byte per pixel to draw on
let bitmap = new bitmapManipulation.Bitmap(400, 300);
let palette = bitmap.getPalette();

// Fill image with light grey background
bitmap.clear(palette.indexOf(0xc0c0c0));

bitmap.drawRectangle(10, 10, 50, 30, null, palette.indexOf(0x000000));
bitmap.drawRectangle(70, 10, 50, 50, null, palette.indexOf(0xff0000), 5);
bitmap.drawRectangle(130, 10, 50, 40, palette.indexOf(0x008000));
bitmap.drawRectangle(190, 10, 50, 50, palette.indexOf(0x000080), palette.indexOf(0xff0000), 5);

bitmap.drawEllipse(10, 70, 50, 30, null, palette.indexOf(0x000000));
bitmap.drawEllipse(70, 70, 50, 50, null, palette.indexOf(0xff0000), 2);
bitmap.drawEllipse(130, 70, 50, 40, palette.indexOf(0x008000));
bitmap.drawEllipse(190, 70, 50, 50, palette.indexOf(0x000080), palette.indexOf(0xff0000), 3);

// Draw overlay bitmap with transparent pixels
let overlayBitmap = bitmapManipulation.Bitmap.fromFile("Overlay.bmp");
bitmap.drawBitmap(overlayBitmap, 10, 130, overlayBitmap.getPalette().indexOf(0xff00ff/*magenta*/));

// Draw text
let font = new bitmapManipulation.Font("../Font/Arial.json");
font.setSize(20);
font.setColor(font.getBitmap().getPalette().indexOf(0x000000/*black*/));
bitmap.drawText(font, "The quick brown fox\njumps over the lazy dog.\n3.14159265358979323846",
		10, 190);

bitmap.changeColorDepth(targetColorDepth);

// Draw gradient rectangle
overlayBitmap = new bitmapManipulation.Bitmap(50, 50);
let overlayBitmapPalette = overlayBitmap.getPalette();
overlayBitmapPalette.length = 0;
for (let i = 0; i <= 0xff; i++) {
	overlayBitmapPalette.push((i << 16) | (i << 8) | i);
}
overlayBitmap.drawGradientRectangle(0, 0, overlayBitmap.getWidth(), overlayBitmap.getHeight(),
		0x00, 0xff);
overlayBitmap.changeColorDepth(targetColorDepth);
bitmap.drawBitmap(overlayBitmap, 70, 130);

bitmap.save("OUT.bmp");
