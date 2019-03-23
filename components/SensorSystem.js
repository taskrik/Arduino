var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  console.log("Ready!");
  const led = new five.Leds([13, 6, 5, 4]);
  const motion = new five.Motion(7);
  const piezo = new five.Piezo(8);

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("calibrated");
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", function() {
    console.log("There is movement!");

    led.blink(500);

    piezo.play({
      // song is composed by an array of pairs of notes and beats
      // The first argument is the note (null means "no note")
      // The second argument is the length of time (beat) of the note (or non-note)
      song: [
        ["C4", 1 / 4],
        ["D4", 1 / 4],
        ["F4", 1 / 4],
        ["D4", 1 / 4],
        ["A4", 1 / 4],
        [null, 1 / 4],
        ["A4", 1],
        ["G4", 1],
        [null, 1 / 2],
        ["C4", 1 / 4],
        ["D4", 1 / 4],
        ["F4", 1 / 4],
        ["D4", 1 / 4],
        ["G4", 1 / 4],
        [null, 1 / 4],
        ["G4", 1],
        ["F4", 1],
        [null, 1 / 2]
      ],
      tempo: 150
    });
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("Clear");
    led.stop();
    led.off();
    piezo.off();
  });
});
