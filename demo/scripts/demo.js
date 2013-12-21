/*globals console, define, document, FileReader, module, steg, window*/

(function (document, window) {
	"use strict";

	var demo = {
		vars: {
			text: {},
			image: {},
			encode: {},
			decode: {},
			download: {}
		},
		setup: function () {
			this.vars.text = document.getElementById("text");
			this.vars.image = document.getElementById("image");
			this.vars.encode = document.getElementById("encode");
			this.vars.decode = document.getElementById("decode");
			this.vars.download = document.getElementById("download");

			return this;
		},
		events: function () {
			var image = this.vars.image,
				encode = this.vars.encode,
				decode = this.vars.decode;

			encode.onclick = this.encode;
			decode.onclick = this.decode;

			image.addEventListener("dragover", this.dragover, false);
			image.addEventListener("dragleave", this.dragover, false);
			image.addEventListener("drop", this.dragdrop, false);
		},
		dragover: function (e) {
			e.stopPropagation();
			e.preventDefault();
			e.target.className = (e.type === "dragover") ? "dragover" : "";
		},
		dragdrop: function (e) {
			var $this = this,
				files = [],
				reader = new FileReader();

			demo.dragover(e);

			files = e.target.files || e.dataTransfer.files;

			if (files[0].type.indexOf("image") === -1) {
				console.error("Invalid file type");
				return false;
			}

			reader.onload = function (e) {
				$this.style.backgroundImage = "url(" + e.target.result + ")";
			};

			reader.readAsDataURL(files[0]);
		},
		encode: function () {
			var $this = demo,
				text = $this.vars.text.value,
				image = $this.vars.image.style.backgroundImage.replace(/^url|['"\(\)]/g, ""),
				download = $this.vars.download;

			steg.encode(image, text, function (encoded) {
				download.className = "show";
				download.href = encoded;
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