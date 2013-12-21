/*globals require, requirejs*/

(function () {
	"use strict";

	requirejs.config({
		"baseUrl": ".",
		"paths": {
			"steg": "../src/steg",
			"demo": "scripts/demo"
		}
	});

	require(["steg"]);
	require(["demo"], function (demo) {
		demo.init();
	});
}());