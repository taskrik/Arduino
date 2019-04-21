var five = require("johnny-five");
var moment = require("moment");

var board = new five.Board();
// const shell = require("shelljs");

const express = require("express");
const app = express();
const port = 3000;

let feedingTimes = 0;
let timeStamps = [];

board.on("ready", function() {
  const led = new five.Leds([13, 6, 5, 4]);
  const lcd = new five.LCD({
    controller: "PCF8574A"
  });
  const motor = new five.Servo({ pin: 11, startAt: 0 });
  console.log("Auto Feeder is Ready!");

  app.post("/feeding/on", function(req, res) {
    console.log("Feeder opened");

    feedingTimes += 1;
    timeStamps.unshift(moment().format("h:mm:ss a"));
    led.blink(500);
    lcd.clear();
    motor.max();
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.json({
      message: "Feeder is open!",
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });

  app.post("/feeding/off", function(req, res) {
    console.log("Feeder closed");

    // shell.exec("./motionCaptures");
    motor.stop();
    motor.home();
    led.stop();
    led.off();
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.json({
      message: "Feeder closed!",
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
