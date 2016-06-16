#!/usr/bin/env node

var colors = require('colors');
var pigpio = require('pigpio');
var gpio = pigpio.Gpio;
var easings = require('./easings.js');

// configure pigpio
pigpio.configureClock(1, 0);

var Robot = function() {

  var self = this;
  var range = [790, 2210];
  var startPosition = 90.0;

  self.debug = false;
  self.enableStop = true;
  self.running = false;
  self.motors = [];
  self.selectedSequences = [];
  self.velvetSequences = [];
  self.natureSequences = [];
  self.ballpitSequences = [];

  // available GPIO for servos:
  // 4, 17, 27, 22, 5, 6, 13, 19
  createMotors([4, 17, 27, 22]);
  createSequences();

  function createMotors(motorPins) {

    for (var i = 0; i < motorPins.length; i++) {

      var newPin = motorPins[i];

      var newMotor = new gpio(newPin, {
        mode: gpio.OUTPUT
      });

      newMotor['lastPosition'] = undefined;
      newMotor['motorId'] = self.motors.length;

      newMotor.goto = function(position) {

        if (position < 0.0) position = 0.0;
        if (position > 180.0) position = 180.0;

        var mappedPosition = Math.floor(position.map(0, 180, range[0], range[1]));

        this.servoWrite(mappedPosition);

      }

      self.motors.push(newMotor);

    }

  }

  function createSequences() {

    // position: 0 - 180
    // speed: 1 - 100

    self.sweepSequence = [
      [0, 25],
      [180, 25]
    ];

    // soft & smooth, slow
    self.velvetSequences = [
      [
        [178, 8],
        [85, 12],
        [162, 5],
        [10, 11]
      ],
      [
        [74, 12],
        [5, 10],
        [42, 13],
        [178, 4],
        [86, 2]
      ],
      [
        [100, 12],
        [47, 10],
        [162, 13],
        [5, 4]
      ],
      [
        [103, 12],
        [87, 8],
        [178, 1],
        [2, 8]
      ]
    ];

    // meandering, crawling, ...
    self.natureSequences = [
      [
        [102, 7],
        [78, 28],
        [23, 3],
        [162, 24]
      ],
      [
        [74, 12],
        [5, 10],
        [42, 29],
        [122, 4],
        [172, 12]
      ],
      [
        [100, 12],
        [76, 22],
        [4, 2],
        [162, 18]
      ],
      [
        [103, 22],
        [122, 5],
        [28, 12],
        [2, 25]
      ]
    ];

    // quick, sudden movements, smash some balls around
    self.ballpitSequences = [
      [
        [178, 11],
        [85, 25],
        [162, 7],
        [10, 18]
      ],
      [
        [74, 18],
        [5, 10],
        [42, 22],
        [178, 14],
        [86, 12]
      ],
      [
        [100, 22],
        [47, 18],
        [162, 12],
        [5, 14]
      ],
      [
        [103, 12],
        [87, 32],
        [178, 21],
        [2, 16]
      ]
    ];

  }

  self.setSequences = function(type) {

    if (type != "velvet" && 
        type != "nature" && 
        type != "ballpit") {
        console.log("\nWrong sequence type! Must be either: velvet, nature, ballpit".bgRed.white.bold);
        return false;
    }

    console.log(("\nSetting sequence type to: " + type).italic.grey);

    switch(type) {

      case "velvet":
        self.selectedSequences = self.velvetSequences;
      break;

      case "nature":
        self.selectedSequences = self.natureSequences;
      break;

      case "ballpit":
        self.selectedSequences = self.ballpitSequences;
      break;

    }

    return true;

  }

  self.center = function() {

    if (self.running) self.stop();

    console.log("\nAll motors moving to center position".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i].goto(startPosition);
      self.motors[i].lastPosition = startPosition;
    }

    // io.emit('status-update', "center");

    return "Ok!";

  }

  self.enableAllMotors = function() {

    console.log("\nEnabling all motors".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i]['isEnabled'] = true;
    }

    // io.emit('status-update', "enableAllMotors");

    return "Ok!";

  }

  self.disableAllMotors = function() {

    console.log("\nDisabling all motors".italic.grey);

    for (var i = 0; i < self.motors.length; i++) {
      self.motors[i]['isEnabled'] = false;
    }

    // io.emit('status-update', "disableAllMotors");

    return "Ok!";

  }

  self.enableMotor = function(motorId) {

    console.log("\nEnabling motor ".italic.grey + motorId);

    self.motors[motorId].isEnabled = true;

    // io.emit('status-update', "enableMotor " + motorId);

    return "Ok!";

  }

  self.disableMotor = function(motorId) {

    console.log("\nDisabling motor".italic.grey + motorId);

    self.motors[motorId].isEnabled = false;

    // io.emit('status-update', "disableMotor" + motorId);

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
      loopSequence(self.motors[i], self.sweepSequence, "motor" + i);
    }

    // io.emit('status-update', "sweep");

    return "Ok!";

  }

  self.start = function() {

    if (self.running) {
      console.log("\nRobot already running!".bgRed.white.bold);
      return false;
    }

    if (self.selectedSequences.length == 0) {
      console.log("\nNo sequence-type selected - defaulting to velvet!".bgRed.white.bold);
      self.setSequences('velvet');
    }

    console.log("\nRobot has been " + "launched!".blue.bold);

    self.running = true;
    self.enableStop = false;

    for (var i = 0; i < self.motors.length; i++) {
      loopSequence(self.motors[i], self.selectedSequences[i], "motor"+i);
    }

    // io.emit('status-update', "start");

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

    // io.emit('status-update', "stop");

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

      motor.goto(startPosition);
      motor.lastPosition = startPosition;

    }

    function gotoNextPosition(newIndex) {

      if (index >= sequenceLength) index = 0;

      var oldPosition = motor.lastPosition;
      var newPosition = sequence[index][0];
      var newSpeed = sequence[index][1];

      if (newSpeed > 100) newSpeed = 100;
      if (newSpeed < 1) newSpeed = 1;

      var newSpeedMapped = newSpeed.map(1, 100, 30, 1);

      if (self.debug && motor.isEnabled) {
        console.log(motorId.grey + ": moving to index " + index.toString().green + " at position " + newPosition.toString().yellow + " with speed " + newSpeed.toString().red);
      }

      if (motor.isEnabled) {

        var emitJson = {
          'motorId': motor.motorId,
          'newPosition': newPosition,
          'newSpeed': newSpeed
        };

        // io.emit('motor-update', emitJson);

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

          var easedPosition = easings.easeInOutQuad(offsetPosition.map(oldPosition, newPosition, firstLimit, secondLimit)).map(firstLimit, secondLimit, oldPosition, newPosition);
          
          if (self.debug) {
            console.log(motorId.grey + ": moving to position " + easedPosition.toString().bold);
          }
          
          motor.goto(easedPosition);

          motor.lastPosition = easedPosition;

        }

        currentPosition = offsetPosition;

        if (currentPosition == newPosition) {

          index++;

          clearInterval(newInterval);
          gotoNextPosition(index);

        }

      }, newSpeedMapped);

    }

  }

};

module.exports = new Robot();