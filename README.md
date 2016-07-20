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

## Documentation

The documentation can be generated from the source code by:

<pre>
[jsdoc](http://usejsdoc.org/) index.js
</pre>

## License

MIT
