const five = require("johnny-five");
const Raspi = require("raspi-io").RaspiIO;

const board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  console.log("Board ready!");

  const lcd = new five.LCD({
    controller: "PCF8574A",
    rows: 2,
    cols: 16
  });

  lcd.print("Hello!");

  this.on("exit", function() {
    lcd.clear();
    lcd.off();
  });
});
