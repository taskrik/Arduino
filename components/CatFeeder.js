var five = require("johnny-five");
var board = new five.Board();
const shell = require("shelljs");

board.on("ready", function() {
  console.log("Auto Feeder is Ready!");
  const led = new five.Leds([13, 6, 5, 4]);
  const lcd = new five.LCD({
    controller: "PCF8574A"
  });
  const motor = new five.Servo({ pin: 11, startAt: 0 });

  let feedingTimes = 0;

  function activateFeeding() {
    feedingTimes += 1;
    led.blink(500);
    lcd.clear();
    motor.max();
    setTimeout(() => {
      motor.stop();
      motor.home();
      return;
    }, 1000);
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
    shell.exec("./motionCaptures");
  }

  activateFeeding();

  this.on("exit", function() {
    led.stop();
    led.off();
    lcd.off();
    motor.stop();
  });
});
