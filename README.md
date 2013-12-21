#steg.js

Client-side steganography application to hide text in images

##Demo

[steg.js](http://kevinselwyn.com/steg.js)

##Usage

Include the script in your document:

```html
<script src="dist/steg.min.js"></script>
```

If you are using a module loader like [RequireJS](http://requirejs.org/), require the module:

```js
require(["dist/steg.min"], function (steg) {
	
});
```

###Encoding

```js
steg.encode(img, text, callback);
```

`img`: URL of the image in which you would like to hide text<br />
`text`: Secret text you would like to hide<br />
`callback`: Function to call after encoding is done. Returns the data URI encoded image

###Decoding

```js
steg.decode(img, callback);
```

`img`: URL of the image you would like to decode<br />
`callback`: Function to call after decoding is done. Returns the secret text

##Explanation

This application works by encoding the text into the least significant bit (LSB) of every RGB color value of individual pixels in the source image. This causes color changes that are virtually imperceptible.

There is a simple header that is added to encoded images. That same header is the first thing the application looks for when decoding. If it is absent, decoding will fail.

<table>
	<tr>
		<th>File Offset</th>
		<th>Field Name</th>
		<th>Field Size (bytes)</th>
	</tr>
	<tr>
		<td>0</td>
		<td>"!steg.js!"</td>
		<td>9</td>
	</tr>
	<tr>
		<td>9</td>
		<td>255 & (text.length >> 16)</td>
		<td>1</td>
	</tr>
	<tr>
		<td>10</td>
		<td>255 & (text.length >> 8)</td>
		<td>1</td>
	</tr>
	<tr>
		<td>11</td>
		<td>255 & text.length</td>
		<td>1</td>
	</tr>
	<tr>
		<td>12</td>
		<td>Reserved for future use<br />(defaults to "0")</td>
		<td>3</td>
	</tr>
</table>

The number of pixels (in addition to the header) needed to successfully encode text in an image is represented by the following formula:

```
# of pixels needed = size of text in bytes * (8 / 3)
```

So a 3kb text would require an image with 8192 pixels, or a roughly 91px<sup>2</sup> image.

##Support

Works on modern browsers with support for the [Canvas API](http://caniuse.com/#feat=canvas). The demo requires further support for the [FileReader API](http://caniuse.com/#feat=filereader).

