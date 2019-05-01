var five = require("johnny-five");
var moment = require("moment");
var fs = require("fs");

var board = new five.Board();
const shell = require("shelljs");

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

app.use(express.static(path.join(__dirname, "motionCaptures")));

let feedingTimes = 0;
let timeStamps = [];

board.on("ready", function() {
  const led = new five.Leds([13, 6, 5, 4]);
  const lcd = new five.LCD({
    controller: "PCF8574A"
  });
  const motor = new five.Servo({ pin: 11, startAt: 0 });
  console.log("Auto Feeder is Ready!");

  //gets feeder's status
  app.get("/feeding", function(req, res) {
    console.log("Getting feeder state");

    return res.json({
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });

  //opens feeder
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

  //closes feeder
  app.post("/feeding/off", function(req, res) {
    console.log("Feeder closed");

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

  //runs bash script to take snapshot
  app.post("/feeding/snapshot/take", function(req, res) {
    shell.exec("../components/webcam.sh");
    return res.json({
      message: "Took snapshot"
    });
  });

  //gets the snapshot
  app.get("/feeding/snapshot/get", function(req, res) {
    return res.send(
      `<img src="../../capture-2019-04-30_2240.jpg" />`
    );
  });

  //resets the feeder counter
  app.post("/feeding/reset", function(req, res) {
    console.log("Counter reset successfully!");

    feedingTimes = 0;
    timeStamps = [];
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.json({
      message: "Counter reset successfully",
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
