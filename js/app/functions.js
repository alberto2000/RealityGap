// FUNCTIONS.JS
define([], function() {

	var module = {};

	// function to get back the current breakpoint
	module.getBreakpoint = function() {

		var result,
		winWidth = $(window).width();

		if (winWidth <= globals.breakpoints.mobile) {
			result = 'mobile';
		} else if (winWidth <= globals.breakpoints.tablet) {
			result = 'tablet';
		} else if (winWidth <= globals.breakpoints.small) {
			result = 'small';
		} else if (winWidth <= globals.breakpoints.medium) {
			result = 'medium';
		} else if (winWidth <= globals.breakpoints.large) {
			result = 'large';
		} else if (winWidth > globals.breakpoints.large) {
			result = 'huge';
		}

		return result;

	}

	return module;

});