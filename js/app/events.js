// EVENTS.JS
define(['functions'], function(Functions) {

	var module = {};

	module.init = function() {

    log("Events module init");

		// bind event handlers
		module.bindEvents();

	}

	module.bindEvents = function() {

		var newBreakpoint;

	    // window resize event
	    $(window).resize(function() {
	
	      newBreakpoint = Functions.getBreakpoint();
	
	      // falling into new breakpoint?
	      if (newBreakpoint != globals.breakpoints.currentBreakpoint) {
	
	        globals.breakpoints.currentBreakpoint = Functions.getBreakpoint();
	
	        log('new breakpoint: ' + globals.breakpoints.currentBreakpoint);
	
	      }
	
	    });

	}

	return module;

});