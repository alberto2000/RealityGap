#!/usr/bin/env node

var colors = require('colors');
require('pigpio').configureClock(1, 0);
var Gpio = require('pigpio').Gpio;

var Robot = function() {

  var self = this;
  var startPosition = 1500;

  self.debug = false;
  self.enableStop = true;
  self.running = false;
  self.motors = [];
  self.sequences = [];

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

      self.motors.push(newMotor);

    }

  }

  function createSequences() {

    self.sequences = [
      [
        [1800, 5],
        [1400, 10],
        [1700, 1],
        [1100, 20]
      ],
      [
        [1100, 20],
        [1300, 6],
        [1100, 10],
        [1900, 7],
        [1400, 30]
      ],
      [
        [1800, 18],
        [1400, 5],
        [1700, 4],
        [1100, 30]
      ],
      [
        [1800, 10],
        [1400, 8],
        [1700, 2],
        [1100, 20]
      ],
      [
        [1800, 2],
        [1400, 9],
        [1700, 13],
        [1100, 7],
        [1700, 25],
        [1100, 4]
      ]
    ];

  }

  self.enableAllMotors = function() {

    console.log("\nEnabling all motors".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i]['isEnabled'] = true;
    }

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
      loopSequence(self.motors[i], self.sequences[i], i);
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