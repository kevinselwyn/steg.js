/*globals console, define, document, FileReader, module, steg, window*/

(function (document, window) {
	"use strict";

	var demo = {
		vars: {
			text: {},
			image: {},
			encode: {},
			decode: {},
			download: {},
			result: {},
			processing: {}
		},
		setup: function () {
			this.vars.text = document.getElementById("text");
			this.vars.image = document.getElementById("image");
			this.vars.encode = document.getElementById("encode");
			this.vars.decode = document.getElementById("decode");
			this.vars.download = document.getElementById("download");
			this.vars.result = document.getElementById("result");
			this.vars.processing = document.getElementById("processing");

			return this;
		},
		events: function () {
			var image = this.vars.image,
				text = this.vars.text,
				encode = this.vars.encode,
				decode = this.vars.decode,
				download = this.vars.download;

			encode.onclick = this.encode;
			decode.onclick = this.decode;

			text.addEventListener("dragover", this.dragover, false);
			text.addEventListener("dragleave", this.dragover, false);
			text.addEventListener("drop", this.dragdrop, false);

			image.addEventListener("dragover", this.dragover, false);
			image.addEventListener("dragleave", this.dragover, false);
			image.addEventListener("drop", this.dragdrop, false);

			download.onclick = this.download;
		},
		dragover: function (e) {
			e.stopPropagation();
			e.preventDefault();
			e.target.className = (e.type === "dragover") ? "dragover" : "";
		},
		dragdrop: function (e) {
			var $this = this,
				id = this.id,
				files = [],
				type = "",
				reader = new FileReader();

			demo.dragover(e);

			files = e.target.files || e.dataTransfer.files;
			type = files[0].type;

			reader.onload = function (e) {
				if (id === "image") {
					$this.style.backgroundImage = "url(" + e.target.result + ")";
				} else {
					$this.value = e.target.result;
				}
			};

			if (id === "image") {
				if (type.indexOf("image") === -1) {
					console.error("Invalid image");
					return;
				}

				reader.readAsDataURL(files[0]);
			} else {
				if (type.indexOf("text") === -1) {
					console.error("Invalid text");
					return;
				}

				reader.readAsText(files[0]);
			}
		},
		download: function () {
			var $this = demo,
				result = $this.vars.result;

			result.className = "show";
		},
		encode: function () {
			var $this = demo,
				text = $this.vars.text.value,
				image = $this.vars.image.style.backgroundImage.replace(/^url|['"\(\)]/g, ""),
				download = $this.vars.download,
				result = $this.vars.result;

			steg.encode(image, text, function (encoded) {
				download.className = "show";
				result.getElementsByTagName("img")[0].src = encoded;
			});
		},
		decode: function () {
			var $this = demo,
				text = $this.vars.text,
				image = $this.vars.image.style.backgroundImage.replace(/^url|['"\(\)]/g, "");

			steg.decode(image, function (decoded) {
				text.value = decoded;
			});
		},
		init: function () {
			this.setup().events();

			return this;
		}
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = demo;
	} else {
		window.demo = demo;

		if (typeof define === "function" && define.amd) {
			define("demo", [], function () {
				return demo;
			});
		}
	}
}(document, window));