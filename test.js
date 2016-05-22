var readline = require("readline");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt("SERVO TEST (0-180)> ");
rl.prompt();

log("hello");

rl.on("line", function(line) {
	rl.prompt();
}).on("close", function() {
	process.exit(0);
});

function log(msg) {

	rl.close();
	console.log("\n"+msg);

	rl.setPrompt("SERVO TEST (0-180)> ");
	rl.prompt();

	log("hello");

	rl.on("line", function(line) {
		rl.prompt();
	}).on("close", function() {
		process.exit(0);
	});

}