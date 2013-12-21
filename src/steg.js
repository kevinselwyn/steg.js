/*globals document, console, define, module, steg, window, XMLHttpRequest*/
/*jslint bitwise:true*/

(function (document, window) {
	"use strict";

	var steg = {
		vars: {
			header: "!steg.js!"
		},
		dec2bin: function (dec) {
			var bin = parseInt(dec, 10).toString(2),
				i = 0,
				l = 8 - bin.length;

			for (i = 0; i < l; i += 1) {
				bin = "0" + bin;
			}

			return bin;
		},
		bin2dec: function (bin) {
			var dec = parseInt(bin, 2).toString(10);

			dec = parseInt(dec, 10);

			return dec;
		},
		bin2ascii: function (bin) {
			var max = Math.floor(bin.length / 8) * 8,
				ascii = "",
				i = 0;

			for (i = 0; i < max; i += 8) {
				ascii += String.fromCharCode(this.bin2dec(bin.substr(i, 8)));
			}

			return ascii;
		},
		canvas: function (url, callback) {
			var canvas = document.createElement("canvas"),
				context = canvas.getContext("2d"),
				img = document.createElement("img");

			img.onload = function () {
				canvas.width = this.width;
				canvas.height = this.height;
				context.drawImage(this, 0, 0);

				callback(canvas);
			};

			img.src = url;
		},
		pixelate: function (canvas, text, callback) {
			var context = canvas.getContext("2d"),
				data = {},
				pixels = [],
				width = canvas.width,
				height = canvas.height,
				x = 0,
				y = 0,
				i = 0,
				l = Math.ceil(text.length * (8 / 3));

			for (y = 0; y < height; y += 1) {
				for (x = 0; x < width; x += 1) {
					data = context.getImageData(x, y, 1, 1).data;
					pixels.push(data);

					i += 1;

					if (i >= l) {
						break;
					}
				}

				if (i >= l) {
					break;
				}
			}

			callback(pixels, text);
		},
		hide: function (pixels, text, callback) {
			var binary = "",
				color = 0,
				colors = [],
				i = 0,
				j = 0,
				k = 0,
				l = 0,
				m = 0;

			/* Convert text to binary */
			for (i = 0, j = text.length; i < j; i += 1) {
				binary += this.dec2bin(text.charCodeAt(i));
			}

			/* Place binary in LSB in RGB */
			for (i = 0, j = pixels.length; i < j; i += 1) {
				for (k = 0, l = 3; k < l; k += 1) {
					color = this.dec2bin(pixels[i][k]);
					color = color.replace(/[01]$/, binary.substring(m, m + 1));
					colors.push(color);

					m += 1;

					if (m >= binary.length) {
						i = j;
						k = l;
					}
				}
			}

			/* Place RGB back in array */
			m = 0;

			for (i = 0, j = pixels.length; i < j; i += 1) {
				for (k = 0, l = 3; k < l; k += 1) {
					pixels[i][k] = this.bin2dec(colors[m]);

					m += 1;
				}
			}

			callback(pixels);
		},
		output: function (pixels, canvas, callback) {
			var context = canvas.getContext("2d"),
				image = context.createImageData(1, 1),
				width = canvas.width,
				height = canvas.height,
				i = 0,
				j = 0,
				k = 0,
				x = 0,
				y = 0;

			for (y = 0; y < height; y += 1) {
				for (x = 0; x < width; x += 1) {
					for (j = 0, k = 3; j < k; j += 1) {
						image.data[j] = pixels[i][j];
					}

					image.data[3] = 255;

					context.putImageData(image, x, y);

					i += 1;

					if (i >= pixels.length) {
						break;
					}
				}

				if (i >= pixels.length) {
					break;
				}
			}

			callback(canvas.toDataURL());
		},
		encode: function (img, text, callback) {
			var $this = this,
				header = this.vars.header,
				length = "",
				reserved = "";

			length += String.fromCharCode(255 & (text.length >> 16));
			length += String.fromCharCode(255 & (text.length >> 8));
			length += String.fromCharCode(255 & (text.length));

			/* Add 3 blank reserved bytes */
			reserved += String.fromCharCode(0);
			reserved += String.fromCharCode(0);
			reserved += String.fromCharCode(0);

			text = header + length + reserved + text;

			this.canvas(img, function (canvas) {
				$this.pixelate(canvas, text, function (pixels, text) {
					$this.hide(pixels, text, function (pixels) {
						$this.output(pixels, canvas, function (encoded) {
							callback(encoded);
						});
					});
				});
			});
		},
		evaluate: function (canvas, callback) {
			var context = canvas.getContext("2d"),
				header = this.vars.header,
				header_bin = "",
				pixels = [],
				pixel_bin = "",
				color = 0,
				width = canvas.width,
				height = canvas.height,
				length = 0,
				length_bin = "",
				encoded_bin = "",
				encoded_length = 0,
				result = "",
				x = 0,
				y = 0,
				i = 0,
				j = 0,
				k = 0,
				l = 0;

			/* Convert header to binary */
			for (i = 0, l = header.length; i < l; i += 1) {
				header_bin += this.dec2bin(header.charCodeAt(i));
			}

			/* Get pixels */
			i = 0;
			l = header.length * (8 / 3);

			for (y = 0; y < height; y += 1) {
				for (x = 0; x < width; x += 1) {
					pixels.push(context.getImageData(x, y, 1, 1).data);

					i += 1;

					if (i >= l) {
						break;
					}
				}

				if (i >= l) {
					break;
				}
			}

			/* Get LSBs from pixels */
			for (i = 0, j = pixels.length; i < j; i += 1) {
				for (k = 0, l = 3; k < l; k += 1) {
					color = pixels[i][k];
					pixel_bin += this.dec2bin(color).substring(7, 8);
				}
			}

			/* Compare */
			if (header_bin !== pixel_bin) {
				console.error("No steganography here");
				return;
			}

			/* Get length of encoded text */
			pixels = [];
			i = 0;
			l = 3 * (8 / 3);
			x += 1;

			for (y; y < height; y += 1) {
				for (x; x < width; x += 1) {
					pixels.push(context.getImageData(x, y, 1, 1).data);

					i += 1;

					if (i >= l) {
						break;
					}
				}

				if (i >= l) {
					break;
				}
			}

			/* Get length data from LSBs */
			for (i = 0, j = pixels.length; i < j; i += 1) {
				for (k = 0, l = 3; k < l; k += 1) {
					color = pixels[i][k];
					length_bin += this.dec2bin(color).substring(7, 8);
				}
			}

			length = this.bin2dec(length_bin);

			/* Skip 3 reserved bytes */
			x += 8;

			/* Get encoded text pixels */
			pixels = [];
			i = 0;
			l = length * (8 / 3);
			x += 1;

			for (y; y < height; y += 1) {
				for (x; x < width; x += 1) {
					pixels.push(context.getImageData(x, y, 1, 1).data);

					i += 1;

					if (i >= l) {
						break;
					}
				}

				if (i >= l) {
					break;
				}

				x = 0;
			}

			/* Get encoded text data from LSBs */
			for (i = 0, j = pixels.length; i < j; i += 1) {
				for (k = 0, l = 3; k < l; k += 1) {
					color = pixels[i][k];
					encoded_bin += this.dec2bin(color).substring(7, 8);
				}
			}

			/* Trim result */
			encoded_length = encoded_bin.length;
			encoded_bin = encoded_bin.substring(0, (Math.floor(encoded_length / 8) * 8));

			/* Binary to ASCII */
			result = this.bin2ascii(encoded_bin);

			callback(result);
		},
		decode: function (img, callback) {
			var $this = this;

			this.canvas(img, function (canvas) {
				$this.evaluate(canvas, function (decoded) {
					callback(decoded);
				});
			});
		}
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = steg;
	} else {
		window.steg = steg;
		
		if (typeof define === "function" && define.amd) {
			define("steg", [], function () {
				return steg;
			});
		}
	}
}(document, window));