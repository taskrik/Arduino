const five = require("johnny-five");
const moment = require("moment");
const path = require("path");
const cv = require("opencv4nodejs");
const express = require("express");
const app = express();
const port = 3000;
const server = require("http").Server(app);
const io = require("socket.io")(server);

const Raspi = require("raspi-io").RaspiIO;

const board = new five.Board({
  io: new Raspi()
});

let feedingTimes = 0;
let timeStamps = [];
let countFramesSent = 0;

const FPS = 30;
const wCap = new cv.VideoCapture(0);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 300);
wCap.set(cv.CAP_PROP_FRAME_WIDTH, 300);

board.on("ready", function() {
  //   const lcd = new five.LCD({
  //     controller: "PCF8574A"
  //   });
  const motor = new five.Servo({
    pin: "GPIO10",
    pwmRange: [600, 2600],
    startAt: 0
  });
  console.log("Auto Feeder is Ready!");

  //gets feeder's status
  app.get("/feeding", function(req, res) {
    console.log("Getting feeder state");

    return res.json({
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });

  //open feeder
  app.post("/feeding/on", function(req, res) {
    console.log("Feeder opened");

    feedingTimes += 1;
    timeStamps.unshift(moment().format("h:mm:ss a"));
    // lcd.clear();
    motor.max();
    // lcd.cursor(0, 2).print("Fed Luke");
    // lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.json({
      message: "Feeder is open!",
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });

  //close feeder
  app.post("/feeding/off", function(req, res) {
    console.log("Feeder closed");

    motor.stop();
    motor.home();
    // lcd.cursor(0, 2).print("Fed Luke");
    // lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.json({
      message: "Feeder closed!",
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });

  //reset the feeder counter
  app.post("/feeding/reset", function(req, res) {
    console.log("Counter reset successfully!");

    feedingTimes = 0;
    timeStamps = [];
    // lcd.cursor(0, 2).print("Fed Luke");
    // lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.json({
      message: "Counter reset successfully",
      feederInfo: { timesUsed: feedingTimes, hours: timeStamps }
    });
  });

  //Start the cctv
  app.get("/feeding/cctv/on", function(req, res) {
    //Capture frame every one second
    const loop = setInterval(() => {
      if (countFramesSent <= 120) {
        const frame = wCap.read();
        const image = cv.imencode(".jpg", frame).toString("base64");
        io.emit("image", image);
        countFramesSent++;
      } else {
        console.log("Camera closed!");
        countFramesSent = 0;
        clearInterval(loop);
      }
    }, 1000 / FPS);

    res.sendFile(path.join(__dirname, "index.html"));
  });
});

server.listen(port, () => console.log(`Listening on port ${port}!`));
