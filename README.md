# bitmap-manipulation

Node.js package for in-memory bitmap manipulation.

[![Build Status](https://travis-ci.org/vonderheide/mono-bitmap.svg?branch=master)](https://travis-ci.org/vonderheide/mono-bitmap)

## Features

* Creating bitmaps (1, 2 or 4 bytes per pixel, in big- or little-endian)
* Changing the color depth
* Reading 8-bit .bmp files
* Saving .bmp files
* Getting/setting pixels
* Change the color of every pixel in a specific color
* Drawing rectangles (horizontal gradient in greyscale possible)
* Drawing circles/ellipses
* Inverting the bitmap
* Drawing a bitmap or a portion of it on a bitmap
* Drawing text with a bitmap font

## Example

```javascript
"use strict";

const bitmapManipulation = require("bitmap-manipulation");

// Create bitmap
let bitmap = new bitmapManipulation.Bitmap(400, 300);

// Draw rectangle with border
bitmap.drawFilledRect(10, 10, 100, 50, 0x00, 0xff);

// Draw another bitmap with some source pixels in a specific color handled as transparent
let overlayBitmap = Bitmap.fromFile("overlayBitmap.bmp");
bitmap.drawBitmap(overlayBitmap, 200, 0, overlayBitmap.getPalette().indexOf(0xff00ff/*magenta*/));

// Draw text
let font = new bitmapManipulation.Font("P:\\ath\\to\\Font.json");
font.setSize(20);
bitmap.drawText(font, "Hello World!", 10, 100);

// The raw pixel data can also be processed in a user-specific way
let bitmapData = bitmap.data();  // Return a Node.js Buffer
```

## Image formats

With release 2.0.0, drawing and pixel storage are separated. This way, 
different image formats (e.g. RGB with interleaved or planar storage) can be used
by providing a `Canvas` implementantion to the `Bitmap` constructor.

The following canvas implementations are included in the distribution:

|Class name               |Description                                           |
|-------------------------|------------------------------------------------------|
|canvas.Grayscale         |Grayscale pixel values                                |
|canvas.RGB               |RGB pixel values, interleaved storage (R-G-B-R-G-B)   |
|canvas.PlanarRGB         |RGB pixel values, planar storage (R-R-G-G-B-B)        |
|canvas.InterleavedStorage|Interleaved storage of values with multiple components|
|canvas.PlanarStorage     |Planar storage of values with multiple components     |
|canvas.Base              |Base class, use this for custom implementations       |

Note that drawing gradients using `drawGradientRect()` only produces sensible results on a grayscale canvas.

### Example: RGB image with 8 bits per pixel per color channel 

```javascript
const bitmapManipulation = require("bitmap-manipulation");

// Create a canvas that stores interleaved RGB pixels 
let canvas = new bitmapManipulation.canvas.RGB(400, 300, 1);

// Create a bitmap that uses this canvas for pixel storage
let bitmap = new bitmapManipulation.Bitmap(canvas);

// Draw a rectangle filled with cyan and a purple border.
// Note that the RGB canvas requires pixel values to be RGB arrays
bitmap.drawFilledRect(10, 10, 100, 50, [255, 0, 255], [0, 255, 255]);

// Get bytes of the image
let imageData = bitmap.data();
```

### Example: RGBA image with 16 bits per pixel per color channel

```javascript
const bitmapManipulation = require("bitmap-manipulation");

// Create a canvas that stores interleaved RGBA pixels 
let canvas = new bitmapManipulation.canvas.Interleaved(400, 300, 4, 2);

// Create a bitmap that uses this canvas for pixel storage
let bitmap = new bitmapManipulation.Bitmap(canvas);

// Draw a rectangle filled with half-opaque cyan and a solid purple border.
let halfOpaqueCyan = [0, 65535, 65535, 32767];
let solidPurple = [65535, 0, 65535, 65535];
bitmap.drawFilledRect(10, 10, 100, 50, halfOpaqueCyan, solidPurple);

// Get bytes of the image
let imageData = bitmap.data();
```

## BMP file support

Loading from and writing to BMP files is supported using the subclass `BMPBitmap`.
See `examples/Drawing` for details.

## Documentation

The documentation can be [generated](http://usejsdoc.org/) from the source code by:

    jsdoc index.js

## License

MIT
