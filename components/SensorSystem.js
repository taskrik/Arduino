var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  console.log("Board is Ready!");
  const led = new five.Leds([13, 6, 5, 4]);
  const motion = new five.Motion(7);
  const piezo = new five.Piezo(8);
  const lcd = new five.LCD({
    controller: "PCF8574A"
  });

  let movementCaptured = 0;

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("Sensor is set!");

    lcd.cursor(0, 2).print("Hello Tasos,");
    lcd.cursor(1, 2).print("Alarm is on!");
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", function() {
    console.log("There is movement!");
    movementCaptured += 1;
    led.blink(500);
    lcd.clear();
    lcd.cursor(0, 2).print("Got movement");
    lcd.cursor(1, 3).print(`${movementCaptured} times`);

    piezo.tone(1000, 500);
    piezo.off();
    // piezo.play({
    //   // song is composed by an array of pairs of notes and beats
    //   // The first argument is the note (null means "no note")
    //   // The second argument is the length of time (beat) of the note (or non-note)
    //   song: [
    //     ["C4", 1 / 4],
    //     ["D4", 1 / 4],
    //     ["F4", 1 / 4],
    //     ["D4", 1 / 4],
    //     ["A4", 1 / 4],
    //     [null, 1 / 4],
    //     ["A4", 1],
    //     ["G4", 1],
    //     [null, 1 / 2],
    //     ["C4", 1 / 4],
    //     ["D4", 1 / 4],
    //     ["F4", 1 / 4],
    //     ["D4", 1 / 4],
    //     ["G4", 1 / 4],
    //     [null, 1 / 4],
    //     ["G4", 1],
    //     ["F4", 1],
    //     [null, 1 / 2]
    //   ],
    //   tempo: 100
    // });
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("All clear!");
    led.stop();
    led.off();
    piezo.off();
  });

  this.on("exit", function() {
    led.stop();
    led.off();
    piezo.off();
    lcd.off();
  });
});
