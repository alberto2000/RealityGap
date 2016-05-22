#!/usr/bin/env node

var repl = require('repl');
var argv = require('yargs').argv;
var Robot = require('./robot.js');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('./'));

http.listen(80);

var debug = false;
var immediateStart = false;
var center = false;
var sweep = false;

if (argv.debug) debug = true;
if (argv.start) immediateStart = true;
if (argv.center) center = true;
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

if (center) {
	Robot.center();
}

if (sweep) {
	Robot.sweep();
}