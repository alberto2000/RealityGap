// ROBOT1.JS
define(['functions', 'events'], function(Functions, Events) {

	var module = {};

	module.init = function() {

		log("Main module init");

		// set lt-ie9 flag
		if ($('html').hasClass('lt-ie9')) {
			globals.ltie9 = true;
		}

		// check for touch
		if ('ontouchstart' in window || navigator.msMaxTouchPoints) {
			$('html').addClass('touch');
		} else {
			$('html').addClass('no-touch');
		}

		// set current breakpoint
		globals.breakpoints.currentBreakpoint = Functions.getBreakpoint($(window).width());

		// init other main modules
		Events.init();

		// create world
		createWorld();

		function createWorld() {

			if (!location.hash) return;

			var worldId = location.hash.replace('#world', '');

			require(['app/worlds/world'+worldId+'/world'+worldId], function(World) {
				World.init();
			});

		}

	}

	return module;

});