const five = require("johnny-five");
const Raspi = require("raspi-io").RaspiIO;

const board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  console.log("Board ready!");

  const motor = new five.Servo({ pin: "GPIO10", pwmRange: [600, 4000], startAt: 0 });

  motor.sweep();

  this.on("exit", function() {
    motor.home();
    motor.stop();
  });
});
