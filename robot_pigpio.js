#!/usr/bin/env node

require('./functions.js');

var colors = require('colors');
require('pigpio').configureClock(1, 0);
var Gpio = require('pigpio').Gpio;

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

      newMotor.enableMotor = function() {
        newMotor.isEnabled = true;
        return "Ok!";
      }

      newMotor.disableMotor = function() {
        newMotor.isEnabled = false;
        return "Ok!";
      }

      newMotor['lastPosition'] = undefined;

      self.motors.push(newMotor);

    }

  }

  function createSequences() {

    self.sweepSequences = [
      [
        [range[0], 3],
        [range[1], 3]
      ],
      [
        [range[0], 3],
        [range[1], 3]
      ],
      [
        [range[0], 3],
        [range[1], 3]
      ],
      [
        [range[0], 3],
        [range[1], 3]
      ],
      [
        [range[0], 3],
        [range[1], 3]
      ]
    ];

    self.moveSequences = [
      [
        [2210, 5],
        [1400, 10],
        [1700, 1],
        [790, 10]
      ],
      [
        [1100, 8],
        [790, 6],
        [1100, 20],
        [2210, 1],
        [1400, 10]
      ],
      [
        [1800, 12],
        [1400, 5],
        [1700, 4],
        [790, 1]
      ],
      [
        [1800, 10],
        [1400, 8],
        [2000, 3],
        [790, 1]
      ],
      [
        [1800, 5],
        [790, 1],
        [1700, 13],
        [1100, 7],
        [2000, 15],
        [1100, 4]
      ]
    ];

  }

  self.calibrate = function() {

    if (self.running) self.stop();

    console.log("\nAll motors moving to neutral position 1500".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i].servoWrite(startPosition);
      self.motors[i].lastPosition = startPosition;
    }

    return "Ok!";

  }

  self.enableAllMotors = function() {

    console.log("\nEnabling all motors".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i]['isEnabled'] = true;
    }

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
      loopSequence(self.motors[i], self.sweepSequences[i], i);
    }

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
      loopSequence(self.motors[i], self.moveSequences[i], i);
    }

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

      var newPosition = sequence[index][0];
      var newSpeed = sequence[index][1];

      if (self.debug) {
        console.log(motorId.blue.bold + ": moving to index " + index.toString().green + " at position " + newPosition.toString().yellow + " with speed " + newSpeed.toString().red + "\n");
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
          motor.servoWrite(offsetPosition);
          motor.lastPosition = offsetPosition;
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