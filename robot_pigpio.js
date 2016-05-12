#!/usr/bin/env node

var colors = require('colors');
require('pigpio').configureClock(1, 0);
var Gpio = require('pigpio').Gpio;

var Robot = function() {

  var self = this;
  var startPosition = 1500;

  self.debug = false;
  self.enableStop = false;

  self.motor1 = new Gpio(17, {
    mode: Gpio.OUTPUT
  });

  self.motor1.enableMotor = function() {
    self.motor1.isEnabled = true;
    return "Ok!";
  }

  self.motor1.disableMotor = function() {
    self.motor1.isEnabled = false;
    return "Ok!";
  }

  self.motor2 = new Gpio(27, {
    mode: Gpio.OUTPUT
  });

  self.motor2.enableMotor = function() {
    self.motor2.isEnabled = true;
    return "Ok!";
  }

  self.motor2.disableMotor = function() {
    self.motor2.isEnabled = false;
    return "Ok!";
  }

  self.motor3 = new Gpio(22, {
    mode: Gpio.OUTPUT
  });

  self.motor3.enableMotor = function() {
    self.motor3.isEnabled = true;
    return "Ok!";
  }

  self.motor3.disableMotor = function() {
    self.motor3.isEnabled = false;
    return "Ok!";
  }

  self.motor4 = new Gpio(23, {
    mode: Gpio.OUTPUT
  });

  self.motor4.enableMotor = function() {
    self.motor4.isEnabled = true;
    return "Ok!";
  }

  self.motor4.disableMotor = function() {
    self.motor4.isEnabled = false;
    return "Ok!";
  }

  self.motor5 = new Gpio(24, {
    mode: Gpio.OUTPUT
  });

  self.motor5.enableMotor = function() {
    self.motor5.isEnabled = true;
    return "Ok!";
  }

  self.motor5.disableMotor = function() {
    self.motor5.isEnabled = false;
    return "Ok!";
  }

  var sequence1 = [
    [1800, 5],
    [1400, 10],
    [1700, 1],
    [1100, 20]
  ];

  var sequence2 = [
    [1100, 20],
    [1300, 6],
    [1100, 10],
    [1900, 7],
    [1400, 30]
  ];

  var sequence3 = [
    [1800, 18],
    [1400, 5],
    [1700, 4],
    [1100, 30]
  ];

  var sequence4 = [
    [1800, 10],
    [1400, 8],
    [1700, 2],
    [1100, 20]
  ];

  var sequence5 = [
    [1800, 2],
    [1400, 9],
    [1700, 13],
    [1100, 7],
    [1700, 25],
    [1100, 4]
  ];

  self.enableAllMotors = function() {

    console.log("\nEnabling all motors".grey.italic);

    self.motor1['isEnabled'] = true;
    self.motor2['isEnabled'] = true;
    self.motor3['isEnabled'] = true;
    self.motor4['isEnabled'] = true;
    self.motor5['isEnabled'] = true;

  }

  self.start = function() {

    console.log("\nRobot has been " + "launched!".blue.bold);

    self.enableStop = false;

    loopSequence(self.motor1, sequence1, "MotorOne");
    loopSequence(self.motor2, sequence2, "MotorTwo");
    loopSequence(self.motor3, sequence3, "MotorThree");
    loopSequence(self.motor4, sequence4, "MotorFour");
    loopSequence(self.motor5, sequence5, "MotorFive");

    return "Ok!";

  }

  self.stop = function() {

    console.log("\nRobot is being " + "stopped!".red.bold);

    self.enableStop = true;

    return "Ok!";

  }

  function loopSequence(motor, sequence, motorId) {

    var index = 0;
    var currentPosition = startPosition;
    var sequenceLength = sequence.length;
    var newInterval = {};

    if (motor.isEnabled) motor.servoWrite(startPosition);

    gotoNextPosition(index);

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

        if (motor.isEnabled) motor.servoWrite(offsetPosition);

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