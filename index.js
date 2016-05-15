#!/usr/bin/env node

var repl = require('repl');
var argv = require('yargs').argv;
var Robot = require('./robot_pigpio.js');
var debug = false;
var immediateStart = false;
var calibrate = false;
var sweep = false;

if (argv.debug) debug = true;
if (argv.start) immediateStart = true;
if (argv.calibrate) calibrate = true;
if (argv.sweep) sweep = true;

console.log("\n–––");
console.log(":: T H E R E A L I T Y G A P ::".rainbow.bold);
console.log("v0.1".bold.grey);
console.log("London, May 2016".grey);

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

if (calibrate) {
	Robot.calibrate();
}

if (sweep) {
	Robot.sweep();
}