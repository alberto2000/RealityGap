#!/usr/bin/env node

var colors = require('colors');
require('pigpio').configureClock(1, 0);
var Gpio = require('pigpio').Gpio;
var easings = require('./easings.js');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '../index.html');
});

app.use(express.static('./'));

http.listen(80);

var Robot = function() {

  var self = this;
  var startPosition = 1500;
  var range = [790, 2210];

  self.debug = false;
  self.enableStop = true;
  self.running = false;
  self.motors = [];
  self.moveSequences = [];

  createMotors([17, 22, 23, 24, 27]);
  createSequences();

  function createMotors(motorPins) {

    for (var i = 0; i < motorPins.length; i++) {

      var newPin = motorPins[i];

      var newMotor = new Gpio(newPin, {
        mode: Gpio.OUTPUT
      });

      newMotor['lastPosition'] = undefined;

      self.motors.push(newMotor);

    }

  }

  function createSequences() {

    self.sweepSequences = [
      [
        [range[0], 5],
        [range[1], 5]
      ],
      [
        [range[0], 5],
        [range[1], 5]
      ],
      [
        [range[0], 5],
        [range[1], 5]
      ],
      [
        [range[0], 5],
        [range[1], 5]
      ],
      [
        [range[0], 5],
        [range[1], 5]
      ]
    ];

    self.moveSequences = [
      [
        [2210, 15],
        [1400, 10],
        [1700, 17],
        [790, 20]
      ],
      [
        [1100, 8],
        [790, 16],
        [1100, 12],
        [2210, 8],
        [1400, 18]
      ],
      [
        [1800, 12],
        [1400, 5],
        [1700, 10],
        [790, 5]
      ],
      [
        [1800, 10],
        [1400, 18],
        [2000, 5],
        [790, 12]
      ],
      [
        [1450, 15],
        [1575, 12],
        [1425, 20],
        [1550, 17]
      ]
    ];

  }

  self.center = function() {

    if (self.running) self.stop();

    console.log("\nAll motors moving to center position".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i].servoWrite(startPosition);
      self.motors[i].lastPosition = startPosition;
    }

    io.emit('status-update', "center");

    return "Ok!";

  }

  self.enableAllMotors = function() {

    console.log("\nEnabling all motors".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i]['isEnabled'] = true;
    }

    io.emit('status-update', "enableAllMotors");

    return "Ok!";

  }

  self.disableAllMotors = function() {

    console.log("\nDisabling all motors".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i]['isEnabled'] = false;
    }

    io.emit('status-update', "disableAllMotors");

    return "Ok!";

  }

  self.enableMotor = function(motorId) {

    console.log("\nEnabling motor".italic.grey + motorId);

    self.motors[motorId].isEnabled = true;

    io.emit('status-update', "enableMotor" + motorId);

    return "Ok!";

  }

  self.disableMotor = function(motorId) {

    console.log("\nDisabling motor".italic.grey + motorId);

    self.motors[motorId].isEnabled = false;

    io.emit('status-update', "disableMotor" + motorId);

    return "Ok!";

  }

  self.sweep = function() {

    if (self.running) {
      console.log("\nRobot already running!".bgRed.white.bold);
      return false;
    }

    console.log("\nMotors are now " + "sweeping!".blue.bold);

    self.running = true;
    self.enableStop = false;

    for (var i = 0; i < self.motors.length; i++) {
      loopSequence(self.motors[i], self.sweepSequences[i], "motor"+i);
    }

    io.emit('status-update', "sweep");

    return "Ok!";

  }

  self.start = function() {

    if (self.running) {
      console.log("\nRobot already running!".bgRed.white.bold);
      return false;
    }

    console.log("\nRobot has been " + "launched!".blue.bold);

    self.running = true;
    self.enableStop = false;

    for (var i = 0; i < self.motors.length; i++) {
      loopSequence(self.motors[i], self.moveSequences[i], "motor"+i);
    }

    io.emit('status-update', "start");

    return "Ok!";

  }

  self.stop = function() {

    if (!self.running) {
      console.log("\nRobot already stopped!".bgRed.white.bold);
      return false;
    }

    console.log("\nRobot is being " + "stopped!".red.bold);

    self.running = false;
    self.enableStop = true;

    io.emit('status-update', "stop");

    return "Ok!";

  }

  function loopSequence(motor, sequence, motorId) {

    var index = 0;
    var currentPosition = startPosition;
    var sequenceLength = sequence.length;
    var newInterval = {};

    gotoStartPosition();
    gotoNextPosition(index);

    function gotoStartPosition() {

      if (!motor.isEnabled) return;

      motor.servoWrite(startPosition);
      motor.lastPosition = startPosition;

    }

    function gotoNextPosition(newIndex) {

      if (index >= sequenceLength) index = 0;

      var oldPosition = motor.lastPosition;
      var newPosition = sequence[index][0];
      var newSpeed = sequence[index][1];

      if (self.debug) {
        console.log(motorId.grey + ": moving to index " + index.toString().green + " at position " + newPosition.toString().yellow + " with speed " + newSpeed.toString().red);
      }

      newInterval = setInterval(function() {

        if (self.enableStop) {
          clearInterval(newInterval);
          return;
        }

        var offsetPosition = currentPosition;

        if (newPosition > currentPosition) offsetPosition = currentPosition + 1;
        if (newPosition < currentPosition) offsetPosition = currentPosition - 1;

        if (motor.isEnabled) {
          
          var firstLimit = 0.0;
          var secondLimit = 1.0;

          if (newPosition < oldPosition) {
            firstLimit = 1.0;
            secondLimit = 0.0;
          }

          var easedPosition = Math.floor(easings.easeInOutQuad(offsetPosition.map(oldPosition, newPosition, firstLimit, secondLimit)).map(firstLimit, secondLimit, oldPosition, newPosition));
          
          if (self.debug) {
            console.log(motorId.grey + ": moving to position " + easedPosition.toString().bold);
          }

          if (easedPosition != motor.lastPosition) motor.servoWrite(easedPosition);

          motor.lastPosition = easedPosition;

        }

        currentPosition = offsetPosition;

        if (currentPosition == newPosition) {

          index++;

          clearInterval(newInterval);
          gotoNextPosition(index);

        }

      }, newSpeed);

    }

  }

};

module.exports = new Robot();