# mono-bitmap

node.js package to create in-memory monochrome bitmaps.

[![Build Status](https://travis-ci.org/vonderheide/mono-bitmap.svg?branch=master)](https://travis-ci.org/vonderheide/mono-bitmap)

## Features

* Create a greyscale bitmap in a node.js Buffer.
* Use 1, 2 or 4 bytes per pixel, in big or little endian.
* Basic drawing operations
  * Set individual pixels to greyscale colors.
  * Filled rectangle with border
  * Rectangle filled with a horizontal gradient.

## Example

```javascript
var MonochromeBitmapImage = require('mono-bitmap');
// create 100x50 image with 2 bytes per pixel in little-endian order.
var image = new MonochromeBitmapImage(100, 50, 2, MonochromeBitmapImage.Endian.LITTLE);
// draw a rectangle with medium-grey border, filled with white
image.drawFilledRect(10, 10, 80, 30, 32817, 65535);
// put a gradient from black to white inside the rectangle
image.drawGradientRect(20, 20, 60, 10, 0, 65535);

// write pixel data to file
var fs = require('fs');
var stream = fs.createWriteStream('image.raw');
stream.write(image.data());
stream.end();
```

## License

MIT
