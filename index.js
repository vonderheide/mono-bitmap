"use strict";

/**
 * @module mono-bitmap
 */

const assert = require("assert");
const structFu = require("struct-fu");
const path = require("path");
const fs = require("fs");

// Data structure for bitmap files (extension .bmp), taken from the Windows API (BITMAPFILEHEADER
// and BITMAPINFOHEADER)
const BitmapFileHeader = structFu.struct([
	structFu.uint16le("signature"),
	structFu.uint32le("fileSize"),
	structFu.uint32le("reserved"),
	structFu.uint32le("dataOffset"),
	structFu.uint32le("bitmapInfoHeaderSize"),
	structFu. int32le("width"),
	structFu. int32le("height"),
	structFu.uint16le("planes"),
	structFu.uint16le("bitsPerPixel"),
	structFu.uint32le("compression"),
	structFu.uint32le("numberOfDataBytes"),
	structFu. int32le("pixelsPerMeterX"),
	structFu. int32le("pixelsPerMeterY"),
	structFu.uint32le("numberOfUsedColors"),
	structFu.uint32le("numberOfImportantColors")
]);
const BITMAP_FILE_SIGNATURE = new Buffer("BM").readUInt16LE(0);
const SIZE_OF_FIRST_PART_OF_BITMAP_FILE_HEADER = (16 + 32 + 32 + 32) / 8;  // That is, before
                                                                           // "bitmapInfoHeaderSize"
const RGB_BITMAP_COMPRESSION = 0;

let Endianness = {
    BIG: 0,
    LITTLE: 1
};
/**
 * @enum {number}
 */
module.exports.Endianness = Endianness;

/**
 * Creates an in-memory bitmap.
 *
 * @class
 * @param {int} width
 * @param {int} height
 * @param {int} [bytesPerPixel=1] Possible values: <code>1</code>, <code>2</code>, <code>4</code>
 * @param {Endianness} [endianness] Use big- or little-endian when storing multiple bytes per pixel.
 *                                  Default: big-endian
 */
module.exports.Bitmap = Bitmap;
function Bitmap(width, height, bytesPerPixel, endianness) {
	let _self = this;
	let _width;
	let _height;
	let _bytesPerPixel;
	let _endianness;
	let _palette = [];
	let _data;
	let _readFunction;
	let _writeFunction;

	/**
	 * Reads a bitmap file (extension .bmp). Only those with 1 byte per pixel are supported.
	 *
	 * @static
	 * @param {string} filePath
	 * @returns {Bitmap}
	 */
	Bitmap.fromFile = function(filePath) {
		let file = fs.openSync(filePath, "r");
		// Read header and validate file by means of it
		let fileBuffer = new Buffer(BitmapFileHeader.size);
		let numberOfBytesRead = fs.readSync(file, fileBuffer, 0, fileBuffer.length, null);
		let hasError = numberOfBytesRead != BitmapFileHeader.size;
		let errorMessage = null;
		let header;
		let offsetAfterHeader;
		if (!hasError) {
			header = BitmapFileHeader.unpack(fileBuffer);
			offsetAfterHeader = SIZE_OF_FIRST_PART_OF_BITMAP_FILE_HEADER +
					header.bitmapInfoHeaderSize;
			let fileSize = fs.fstatSync(file).size;
			hasError =
				header.signature !== BITMAP_FILE_SIGNATURE ||
				header.fileSize !== fileSize ||
				header.dataOffset < offsetAfterHeader || header.dataOffset >= fileSize ||
				offsetAfterHeader < BitmapFileHeader.size ||
				header.width < 1 || header.height < 1 ||
				header.planes != 1 ||
				[1, 4, 8, 16, 24, 32].indexOf(header.bitsPerPixel) == -1 ||
				header.compression != RGB_BITMAP_COMPRESSION ||
				header.numberOfDataBytes > fileSize - offsetAfterHeader
			;
			// Go a little further if header is longer than the structure
			if (BitmapFileHeader.size < offsetAfterHeader) {
				hasError |= fs.readSync(file, fileBuffer, 0, 1, offsetAfterHeader - 1) != 1;
			}
		}
		if (!hasError && header.bitsPerPixel != 8) {
			hasError = true;
			errorMessage = `Unsupported number of bits per pixel in file "${filePath}".`;
		}
		// Read palette
		let bitmap = null;
		if (!hasError) {
			bitmap = new Bitmap(header.width, header.height);
			let palette = bitmap.getPalette();
			let filePosition = offsetAfterHeader;
			fileBuffer = new Buffer(4);
			while (filePosition < header.dataOffset) {
				let numberOfBytesRead = fs.readSync(file, fileBuffer, 0, fileBuffer.length, null);
				if (numberOfBytesRead != fileBuffer.length) {
					hasError = true;
					errorMessage = `Unexpected end of file in "${filePath}".`;
					break;
				}
				palette.push(fileBuffer.readUInt32LE(0) & 0xffffff);
				filePosition += fileBuffer.length;
			}
			if (filePosition != header.dataOffset) {  // Palette bytes aren't a multiple of 4
				hasError = true;
			}
		}
		// Read pixels
		if (!hasError) {
			let bitmapData = bitmap.getData();
			let numberOfBytesPerLine = Math.ceil(header.width * header.bitsPerPixel / 8/*bits*/ /
					4/*bytes*/) * 4/*bytes*/;
			fileBuffer = new Buffer(numberOfBytesPerLine);
			for (let y = header.height - 1; y >= 0; y--) {
				let numberOfBytesRead = fs.readSync(file, fileBuffer, 0, numberOfBytesPerLine,
						null);
				if (numberOfBytesRead != numberOfBytesPerLine) {
					hasError = true;
					errorMessage = `Unexpected end of file in "${filePath}".`;
					break;
				}
				fileBuffer.copy(bitmapData, y * header.width, 0, header.width);
			}
		}
		// Finish
		fs.closeSync(file);
		if (hasError) {
			throw new Error(errorMessage || `Could not recognize the file "${filePath}".`);
		}
		return bitmap;
	};

	function constructor() {
		_width = width;
		_height = height;
		_bytesPerPixel = bytesPerPixel === undefined ? 1 : bytesPerPixel;
		_endianness = endianness === undefined ? Endianness.BIG : endianness;
		_data = new Buffer(_width * _height * _bytesPerPixel);

		// Validate bytes per pixel
	    if (_bytesPerPixel !== 1 && _bytesPerPixel !== 2 && _bytesPerPixel !== 4) {
	        throw new TypeError(`Invalid number of bytes per pixel: ${_bytesPerPixel}.`);
	    }

		// Get read and write function according to bytes per pixel to use it directly
		switch (_bytesPerPixel) {
			case 1: {
				_readFunction = Buffer.prototype.readUInt8;
				_writeFunction = Buffer.prototype.writeUInt8;
				break;
			} case 2: {
				if (_endianness === Endianness.BIG) {
					_readFunction = Buffer.prototype.readUInt16BE;
					_writeFunction = Buffer.prototype.writeUInt16BE;
				} else {
					_readFunction = Buffer.prototype.readUInt16LE;
					_writeFunction = Buffer.prototype.writeUInt16LE;
				}
				break;
			} case 4: {
				if (_endianness === Endianness.BIG) {
					_readFunction = Buffer.prototype.readUInt32BE;
					_writeFunction = Buffer.prototype.writeUInt32BE;
				} else {
					_readFunction = Buffer.prototype.readUInt32LE;
					_writeFunction = Buffer.prototype.writeUInt32LE;
				}
				break;
			}
		}

    	_self.clear();  // Initialize to black
	}

    /**
     * @returns {int}
     */
    _self.getWidth = function() {
        return _width;
    };

    /**
     * @returns {int}
     */
    _self.getHeight = function() {
        return _height;
    };

    /**
     * @returns {int}
     */
    _self.getBytesPerPixel = function() {
        return _bytesPerPixel;
    };

    /**
     * @returns {int}
     */
    _self.getEndianness = function() {
        return _endianness;
    };

	/**
	 * @returns {int[]} An array of RGB colors (<code>0xRRGGBB</code>) to indices. You can use
	 *                  <code>indexOf()</code> to get a color for the other methods
	 */
	_self.getPalette = function() {
		return _palette;
	};

    /**
     * @returns {Buffer} The byte data of this bitmap
     */
    _self.getData = function() {
        return _data;
    };

    /**
     * Sets all data bytes (not necessarily pixels) to the specified value.
	 *
	 * @param {int} [byteValue=0]
     */
    _self.clear = function(byteValue) {
		if (!byteValue) {
			byteValue = 0;
		}
        _data.fill(byteValue);
    };

    /**
     * @param {int} x X-coordinate
     * @param {int} y Y-coordinate
     * @returns {int} The pixel color or <code>null</code> when the coordinates are out of the
	 *                bitmap surface
     */
    _self.getPixel = function(x, y) {
		if (x < 0 || x >= _width) {
			return null;
		}
		try {
			return _readFunction.call(_data, (y * _width + x) * _bytesPerPixel);
		} catch (error) {
			return null;
		}
    };

    /**
     * Sets the pixel at the given coordinates.
     *
     * @param {int} x X-coordinate
     * @param {int} y Y-coordinate
     * @param {int} color The raw pixel value according to the bytes per pixel
     */
    _self.setPixel = function(x, y, color) {
		if (x >= 0 && x < _width) {
			_writeFunction.call(_data, color, (y * _width + x) * _bytesPerPixel, true);
		}
    };

	/**
	 * Sets the color of every pixel in a specific color to a new color.
	 *
	 * @param {int} color The current color to get rid of
	 * @param {int} newColor The new color to use for the identified pixels
	 */
	_self.replaceColor = function(color, newColor) {
		for (let offset = 0; offset < _data.length; offset += _bytesPerPixel) {
			if (_readFunction.call(_data, offset) === color) {
				_writeFunction.call(_data, newColor, offset);
			}
		}
	};

    /**
     * Draws a rectangle, optionally filled, optionally with a border.
	 *
     * @param {int} left Starting x coordinate
     * @param {int} top Starting y coordinate
     * @param {int} width Width of the rectangle
     * @param {int} height Height of the rectangle
	 * @param {int} color Color to fill the rectangle with. Pass <code>null</code> to indicate no
	 *                    filling
     * @param {int} [borderColor] Color of the border
	 * @param {int} [borderWidth=1]
     */
    _self.drawRectangle = function(left, top, width, height, color, borderColor, borderWidth) {
		if (borderColor === undefined) {
			borderColor = null;
		}
		if (borderWidth === undefined) {
			borderWidth = 1;
		}
		let x, y, right, bottom;
		// Draw border
		if (borderColor !== null) {
			// Draw left and right border (without the parts that intersect with the horizontal
			// borders)
			bottom = top + height - borderWidth;
			for (y = top + borderWidth; y < bottom; y++) {
				right = Math.min(left + borderWidth, left + width);
	        	for (x = left; x < right; x++) {
	                _self.setPixel(x, y, borderColor);
	            }
				right = left + width;
	        	for (x = Math.max(left + width - borderWidth, left); x < right; x++) {
	                _self.setPixel(x, y, borderColor);
	            }
	        }
			// Draw top and bottom border
			right = left + width;
        	for (x = left; x < right; x++) {
				bottom = Math.min(top + borderWidth, top + height);
				for (y = top; y < bottom; y++) {
	                _self.setPixel(x, y, borderColor);
		        }
				bottom = top + height;
				for (y = Math.max(top + height - borderWidth, top); y < bottom; y++) {
	                _self.setPixel(x, y, borderColor);
		        }
            }
			left += borderWidth;
			top += borderWidth;
			width = Math.max(width - borderWidth * 2, 0);
			height = Math.max(height - borderWidth * 2, 0);
		}
		// Draw filled area
		if (color !== null) {
			right = left + width;
			bottom = top + height;
			for (y = top; y < bottom; y++) {
	        	for (x = left; x < right; x++) {
	                _self.setPixel(x, y, color);
	            }
	        }
		}
    };

    /**
     * Draws a rectangle that's filled with a horizontal gradient.
     *
     * @param {int} left Starting x coordinate
     * @param {int} top Starting y coordinate
     * @param {int} width Width of the rectangle
     * @param {int} height Height of the rectangle
     * @param {int} leftColor Greyscale color of the leftmost pixel
     * @param {int} rightColor Greyscale color of the rightmost pixel
     */
    _self.drawGradientRectangle = function(left, top, width, height, leftColor, rightColor) {
		let right = left + width;
		let bottom = top + height;
		for (let x = left; x < right; x++) {
			let color = Math.round(leftColor + (x - left) / (width - 1) * (rightColor - leftColor));
			for (let y = top; y < bottom; y++) {
				_self.setPixel(x, y, color);
			}
		}
    };

	/**
	 * Draws a circle or ellipse. Note: Drawing a thin border lacks quality.
	 *
	 * @param {int} left
	 * @param {int} top
	 * @param {int} width
	 * @param {int} height
	 * @param {int} color Color of the filling. Pass <code>null</code> for transparency
	 * @param {int} [borderColor]
	 * @param {int} [borderWidth=1]
	 */
	_self.drawEllipse = function(left, top, width, height, color, borderColor, borderWidth) {
		borderWidth = borderColor !== undefined && borderColor !== null ?
				(borderWidth ? borderWidth : 1) : 0;

		let hasSolidFilling = color !== null;
		let centerX = width / 2;
		let centerY = height / 2;
		let circleFactorY = width / height;  // Used to convert the ellipse to a circle for an
		                                     // easier algorithm
		let circleRadiusSquared = Math.pow(width / 2, 2);
		let right = left + width;
		let bottom = top + height;
		for (let y = top; y < bottom; y++) {
			let circleYSquared = Math.pow((y - top - centerY + 0.5) * circleFactorY, 2);
			let intermediateY = y - top - centerY;
			let innerCircleYSquared = Math.pow(
					(intermediateY + Math.sign(intermediateY) * borderWidth + 0.5) * circleFactorY,
					2);
			for (let x = left; x < right; x++) {
				let currentCircleRadiusSquared = Math.pow(x - left - centerX + 0.5, 2) +
						circleYSquared;
				if (currentCircleRadiusSquared <= circleRadiusSquared) {
					let intermediateX = x - left - centerX;
					currentCircleRadiusSquared = Math.pow(
							intermediateX + Math.sign(intermediateX) * borderWidth + 0.5, 2) +
							innerCircleYSquared;
					if (currentCircleRadiusSquared <= circleRadiusSquared) {
						hasSolidFilling && _self.setPixel(x, y, color);
					} else {
						_self.setPixel(x, y, borderColor);
					}
				}
			}
		}
	};

	/**
	 * Inverts the image by negating every data bit.
	 */
	_self.invert = function() {
		for (let i = 0; i < _data.length; i++) {
			_data[i] = ~_data[i];
		}
	};

	/**
	 * Draws another bitmap or a portion of it on this bitmap. You can specify a color from the
	 * source bitmap to be handled as transparent.
	 *
	 * @param {Bitmap} bitmap
	 * @param {int} x
	 * @param {int} y
	 * @param {int} [transparentColor]
	 * @param {int} [sourceX]
	 * @param {int} [sourceY]
	 * @param {int} [width]
	 * @param {int} [height]
	 */
	_self.drawBitmap = function(bitmap, x, y, transparentColor, sourceX, sourceY, width, height) {
		// Validate parameters
		if (bitmap.getBytesPerPixel() !== _bytesPerPixel) {
			throw new Error("The number of bytes per pixel from both bitmaps don't match.");
		}
		let bitmapWidth = bitmap.getWidth();
		let bitmapHeight = bitmap.getHeight();
		sourceX = sourceX === undefined ? 0 : sourceX;
		sourceY = sourceY === undefined ? 0 : sourceY;
		width = width === undefined ? bitmapWidth : width;
		height = height === undefined ? bitmapHeight : height;
		transparentColor = transparentColor === undefined ? null : transparentColor;

		// Correct coordinates
		// Prevent coordinates out of the source bitmap
		let correction = -Math.min(sourceX, 0);
		sourceX += correction;
		width = Math.max(width - correction, 0);
		width -= width - Math.min(bitmapWidth - sourceX, width);
		correction = -Math.min(sourceY, 0);
		sourceY += correction;
		height = Math.max(height - correction, 0);
		height -= height - Math.min(bitmapHeight - sourceY, height);
		// Prevent coordinates out of the destination bitmap
		correction = -Math.min(x, 0);
		sourceX += correction;
		x += correction;
		width -= correction;
		correction = -Math.min(y, 0);
		sourceY += correction;
		y += correction;
		height -= correction;
		width -= width - Math.min(_width - x, width);
		height -= height - Math.min(_height - y, height);

		// Transfer pixels
		let bitmapData = bitmap.getData();
		for (
			let lineOffset = (y * _width + x) * _bytesPerPixel,
			    endOffset = ((y + height - 1) * _width + x + width) * _bytesPerPixel,
			    bitmapLineOffset = (sourceY * bitmapWidth + sourceX) * _bytesPerPixel,
				numberOfBytesPerLine = _width * _bytesPerPixel,
				numberOfBytesPerBitmapLine = bitmapWidth * _bytesPerPixel,
			    numberOfBytesPerPortionLine = width * _bytesPerPixel;
			lineOffset < endOffset;
			lineOffset += numberOfBytesPerLine, bitmapLineOffset += numberOfBytesPerBitmapLine
		) {
			for (
				let offset = lineOffset,
				    lineEndOffset = lineOffset + numberOfBytesPerPortionLine,
				    bitmapOffset = bitmapLineOffset;
				offset < lineEndOffset;
				offset += _bytesPerPixel, bitmapOffset += _bytesPerPixel
			) {
				let color = _readFunction.call(bitmapData, bitmapOffset);
				if (color !== transparentColor) {
					_writeFunction.call(_data, color, offset);
				}
			}
		}
	};

	/**
	 * Draws text with a bitmap font by drawing a bitmap portion for each character. The text may
	 * contain line breaks. The position is specified as the upper left coordinate of the rectangle
	 * that will contain the text.
	 *
	 * @param {Font} font
	 * @param {string} text
	 * @param {int} x
	 * @param {int} y
	 */
	_self.drawText = function(font, text, x, y) {
		let fontBitmap = font.getBitmap();
		let lineHeight = font.getLineHeight();
		let fontDetails = font.getFontDetails();
		let characterInfoMap = fontDetails.chars;
		let kernings = fontDetails.kernings;
		let transparentColor = font.getTransparentColor();
		let lines = text.split(/\r?\n|\r/);
		let lineX = x;
		for (let line of lines) {
			let lastCharacter = null;
			for (let i = 0; i < line.length; i++) {
				let character = line[i];
				let characterInfo = characterInfoMap[character];
				if (!characterInfo) {
					continue;
				}
				let kerning = kernings[character];
				if (kerning && lastCharacter) {
					kerning = kerning[lastCharacter];
					kerning && (x += kerning.amount);
				}
				_self.drawBitmap(fontBitmap, x + characterInfo.xoffset, y + characterInfo.yoffset,
						transparentColor, characterInfo.x, characterInfo.y, characterInfo.width,
						characterInfo.height);
				x += characterInfo.xadvance;
			}
			x = lineX;
			y += lineHeight;
		}
	};

	constructor();
}

/**
 * Creates a bitmap font that's read from JSON and image files. There's a main JSON file that
 * references another JSON file for each provided font size. Use the <code>bmfont2json</code>
 * utility for converting from .fnt to .json and convert the image files. The image files have to be
 * 8-bit .bmp files with a black background and white glyph pixels.
 *
 * @class
 * @param {string} filePath Path to the JSON main file of the font
 */
module.exports.Font = function Font(filePath) {
	let _self = this;
	let _firstSize;
	let _fontDataToSize = [];
	let _size;
	let _transparentColor;
	let _color;

	function constructor() {
		// Read JSON main and subfiles, create Bitmaps
		let json = fs.readFileSync(filePath);  // throws Error
		let filesAndSizes = JSON.parse(json);  // throws SyntaxError
		assert(filesAndSizes instanceof Array && filesAndSizes.length >= 1);
		let lastFontData;
		for (let fileAndSize of filesAndSizes) {
			assert(fileAndSize.size && fileAndSize.filename);
			// Read JSON subfile
			let fontData = { };
			_fontDataToSize[fileAndSize.size] = fontData;
			json = fs.readFileSync(path.join(path.dirname(filePath), fileAndSize.filename));
					// throws Error
			fontData.details = JSON.parse(json);  // throws SyntaxError
			assert(fontData.details.imageFileName);
			assert(
				!lastFontData || (
					fontData.details.info.face == lastFontData.details.info.face &&
					fontData.details.info.bold == lastFontData.details.info.bold &&
					fontData.details.info.italic == lastFontData.details.info.italic
				)
			);
			// Create bitmap from font image file
			fontData.bitmap = Bitmap.fromFile(
					path.join(path.dirname(filePath), fontData.details.imageFileName));
			let palette = fontData.bitmap.getPalette();
			let currentColor = palette.indexOf(0x000000/*black*/);
			assert(currentColor > -1);
			_transparentColor = palette.indexOf(0xff00ff/*magenta*/);
			if (_transparentColor == -1) {
				_transparentColor = 0x80;
			}
			fontData.bitmap.replaceColor(currentColor, _transparentColor);
//			currentColor = palette.indexOf(0xffffff/*white*/);
//			_color = palette.indexOf(0x000000/*black*/);
//			assert(currentColor > -1 && _color > -1);
//			fontData.bitmap.replaceColor(currentColor, _color);
			lastFontData = fontData;
		}
		// Set size variables to first available
		for (
			_firstSize = 0, _size = 0;
			_size < _fontDataToSize.length;
			_firstSize++, _size++
		) {
			if (_fontDataToSize[_size]) {
				break;
			}
		}
	}

	/**
	* @returns {string}
	*/
	_self.getName = function() {
		return _fontDataToSize[_firstSize].details.info.face;
	};

	/**
	 * @returns {int[]}
	 */
	_self.getSizes = function() {
		let sizes = [];
		for (let size = _firstSize; size < _fontDataToSize.length; size++) {
			if (_fontDataToSize[size]) {
				sizes.push(size);
			}
		}
		return sizes;
	};

	/**
	 * @returns {int}
	 */
	_self.getSize = function() {
		return _size;
	};

	/**
	 * @param {int} size
	 */
	_self.setSize = function(size) {
		if (!_fontDataToSize[size]) {
			throw new Error("The size doesn't exist.");
		}
		_size = size;
	};

	/**
	 * @returns {boolean}
	 */
	_self.isBold = function() {
		return _fontDataToSize[_firstSize].details.info.bold;
	};

	/**
	 * @returns {boolean}
	 */
	_self.isItalic = function() {
		return _fontDataToSize[_firstSize].details.info.italic;
	};

	/**
	 * @returns {int}
	 */
	_self.getColor = function() {
		return _color;
	};

	/**
	 * Sets the font color for the current font size. This will perform a color replace action on
	 * the Bitmap of the current font size.
	 *
	 * @param {int} color
	 */
	_self.setColor = function(newColor) {
		_fontDataToSize[_size].bitmap.replaceColor(_color, newColor);
		_color = newColor;
	};

	/**
	 * @returns {int}
	 */
	_self.getTransparentColor = function() {
		return _transparentColor;
	};

	/**
	 * @returns {int}
	 */
	_self.getLineHeight = function() {
		return _fontDataToSize[_size].details.common.lineHeight;
	};

	/**
	 * @param {int} lineHeight
	 */
	_self.setLineHeight = function(lineHeight) {
		_fontDataToSize[_size].details.common.lineHeight = lineHeight;
	};

	/**
	 * @returns {int}
	 */
	_self.getBaseLineY = function() {
		return _fontDataToSize[_size].details.common.base;
	};

	/**
	 * @returns {Object} The object read from the JSON file for the current font size
	 */
	_self.getFontDetails = function() {
		return _fontDataToSize[_size].details;
	};

	/**
	 * @returns {Bitmap}
	 */
	_self.getBitmap = function() {
		return _fontDataToSize[_size].bitmap;
	};

	/**
	 * Measures the dimensions of the provided text.
	 *
	 * @param {string} text
	 * @returns {Object} An object with the members <code>width</code> and <code>height</code>
	 */
	_self.measure = function(text) {
		let fontData = _fontDataToSize[_size];
		let lineHeight = fontData.details.common.lineHeight;
		let width = 0;
		let height = 0;
		let characterInfoMap = fontData.details.chars;
		let kernings = fontData.details.kernings;
		let lines = text.split(/\r?\n|\r/);
		for (let line of lines) {
			let lineWidth = 0;
			let lastCharacter = null;
			for (let i = 0; i < line.length; i++) {
				let character = line[i];
				let characterInfo = characterInfoMap[character];
				if (!characterInfo) {
					continue;
				}
				let kerning = kernings[character];
				if (kerning && lastCharacter) {
					kerning = kerning[lastCharacter];
					kerning && (lineWidth += kerning.amount);
				}
				lineWidth += characterInfo.xadvance;
			}
			width = Math.max(width, lineWidth);
			height += lineHeight;
		}
		return {
			width: width,
			height: height
		};
	};

	constructor();
};
