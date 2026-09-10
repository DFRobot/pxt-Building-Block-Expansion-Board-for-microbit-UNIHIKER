# Building Block Expansion Board

[The Building Block Expansion Board for micro:bit / UNIHIKER provides motor, servo, function pin, battery, and temperature/humidity sensor control over I2C.](https://www.dfrobot.com/product-3021.html)

## Basic usage

## Example

A detailed MakeCode tutorial is available here: [https://wiki.dfrobot.com/mbt0044/](https://wiki.dfrobot.com/mbt0044/)

* Initialize the expansion board, then run motor M1 forward and show the battery level.

```blocks
    ExpansionBoard.initialize()
    ExpansionBoard.controlMotor(ExpansionBoard.MyEnumMotor.M1, ExpansionBoard.MyEnumDir.Forward, 128)
    basic.showNumber(ExpansionBoard.readBattery())

```

* Set pin C0 to DHT11 mode and read temperature in a loop.

```blocks
    ExpansionBoard.initialize()
    ExpansionBoard.setPinMode(ExpansionBoard.PinNumber.C0, ExpansionBoard.PinMode.DHT11)
    basic.forever(function () {
        serial.writeLine("T:" + ExpansionBoard.readSensor(ExpansionBoard.PinNumber.C0, ExpansionBoard.SensorType.DHT11Temperature))
        basic.pause(1000)
    })

```

## License

MIT

Copyright (c) 2020, microbit/micropython Chinese community

## Supported targets

* for PXT/microbit
