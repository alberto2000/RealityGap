requirejs.config({
	paths: {
		'jquery': 'vendor/jquery-1.12.0.min',
		'imagesloaded': 'vendor/imagesloaded.pkgd.min',
		'globals': 'globals',
		'functions': 'app/functions',
		'main': 'app/main',
		'events': 'app/events',
		'three': 'vendor/three',
		'physijs': 'vendor/physi',
		'socketio': 'vendor/socket.io-1.4.5',
		'orbitcontrols': 'plugins/OrbitControls',
		'stlloader': 'plugins/STLLoader'
	},
	shim: {
		'physijs': {
			deps: ['three']
		},
		'orbitcontrols': {
			deps: ['three']
		},
		'stlloader': {
			deps: ['three']
		}
	},
	urlArgs: 'bust=' + (new Date()).getTime() // CACHE BUSTING - REMOVE ON PRODUCTION
});

require(['globals', 'jquery', 'three', 'orbitcontrols', 'physijs', 'stlloader'], function() {

	require(['main', 'imagesloaded'], function(Main, imagesLoaded) {

		imagesLoaded.makeJQueryPlugin($);
		
		$(document).ready(function() {
			Main.init();
		});

	});

});