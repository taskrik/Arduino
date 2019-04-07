var five = require("johnny-five");
var board = new five.Board();
// const shell = require("shelljs");

const express = require("express");
const app = express();
const port = 3000;

let feedingTimes = 0;

board.on("ready", function() {
  app.get("/", (req, res) => {
    res.send("Dashboard main page!")
    motor.home();
    led.stop();
    led.off();
  });

  const led = new five.Leds([13, 6, 5, 4]);
  const lcd = new five.LCD({
    controller: "PCF8574A"
  });
  const motor = new five.Servo({ pin: 11, startAt: 0 });
  console.log("Auto Feeder is Ready!");

  app.get("/feeding/on", function(req, res) {
    res.send("Activating feeder");
    console.log("Feeder opened");
    
    feedingTimes += 1;
    led.blink(500);
    lcd.clear();
    motor.max();
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
  });

  app.get("/feeding/off", function(req, res) {
    res.send("Closing feeder");
    console.log("Feeder closed");
    
    // shell.exec("./motionCaptures");
    motor.stop();
    motor.home();
    led.stop();
    led.off();
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
