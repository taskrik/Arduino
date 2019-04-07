var five = require("johnny-five");
var board = new five.Board();
// const shell = require("shelljs");

const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

console.log(path.join(__dirname, "public"));

let feedingTimes = 0;

board.on("ready", function() {
  app.get("/", (req, res) => {
    motor.stop();
    motor.home();
    led.stop();
    led.off();
    return res.render("index", { status: "Press Button To Feed Luke !!" });
  });

  const led = new five.Leds([13, 6, 5, 4]);
  const lcd = new five.LCD({
    controller: "PCF8574A"
  });
  const motor = new five.Servo({ pin: 11, startAt: 0 });
  console.log("Auto Feeder is Ready!");

  app.post("/feeding/on", function(req, res) {
    console.log("Feeder opened");

    feedingTimes += 1;
    led.blink(500);
    lcd.clear();
    motor.max();
    lcd.cursor(0, 2).print("Fed Luke");
    lcd.cursor(1, 3).print(`${feedingTimes} times`);
    return res.render("index", { status: "Feeder opened" });
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
    return res.render("index", { status: "Feeder closed" });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
