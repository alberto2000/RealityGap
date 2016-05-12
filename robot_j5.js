var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var led = new five.Led(13);
  var servos = new five.Servos([{
		pin: 9,
		range: [0, 180],
		fps: 100,
    specs: {
      speed: five.Servo.Continuous.speeds["@5.0V"]
    }
	}, {
		pin: 10,
		range: [0, 180],
		fps: 100,
    specs: {
      speed: five.Servo.Continuous.speeds["@5.0V"]
    }
	}]);

	GLOBAL.servos = servos;

  led.blink(500);

  console.log("Robot Ready!");

});