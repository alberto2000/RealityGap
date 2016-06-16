#!/usr/bin/env node

var repl = require('repl');
var argv = require('yargs').argv;
var Robot = require('./robot.js');
var art = require('ascii-art');

var debug = false;
var immediateStart = false;
var center = false;
var sweep = false;

if (argv.debug) debug = true;
if (argv.start) immediateStart = true;
if (argv.center) center = true;
if (argv.sweep) sweep = true;

art.font('The Reality Gap', 'Doom', function(rendered) {

	console.log("\033[2J");

    console.log("\n"+art.style(rendered, 'bright_yellow'));

	console.log("\n–––");
	console.log(":: T H E R E A L I T Y G A P ::".rainbow.bold);
	console.log("v0.5".bold.grey);
	console.log("London, June 2016".grey);

	Robot.enableAllMotors();

	var replServer = repl.start({
	  prompt: "Robot Control > "
	});

	replServer.context.Robot = Robot;

	if (debug) Robot.debug = true;

	if (immediateStart) {
		console.log("\nImmediate Start!");
		Robot.start();
	}

	if (center) {
		Robot.center();
	}

	if (sweep) {
		Robot.sweep();
	}

});