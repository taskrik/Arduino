const five = require("johnny-five");
const moment = require("moment");
const path = require("path");
const cv = require("opencv4nodejs");
const express = require("express");
const app = express();
const port = 3000;
const server = require("http").Server(app);
const io = require("socket.io")(server);

var board = new five.Board();
let feedingTimes = 0;
let timeStamps = [];

const FPS = 30;
const wCap = new cv.VideoCapture(0);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 300);
wCap.set(cv.CAP_PROP_FRAME_WIDTH, 300);

app.get("/feeding/cctv", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

//Capture frame every one second
setInterval(() => {
  const frame = wCap.read();
  const image = cv.imencode(".jpg", frame).toString("base64");
  io.emit("image", image);
}, 1000 / FPS);

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

server.listen(port, () => console.log(`Listening on port ${port}!`));
