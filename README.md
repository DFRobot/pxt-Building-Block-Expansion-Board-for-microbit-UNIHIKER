# Building Block Expansion Board

[The Building Block Expansion Board for micro:bit / UNIHIKER provides motor, servo, function pin, battery, and temperature/humidity sensor control over I2C.](https://www.dfrobot.com/product-3021.html)

## Basic usage

Call **initialize device** once before any other block. It enables the board over I2C and sets the motor PWM period. After that, use the blocks below for motors, servos, function pins, the battery, and sensors.

A detailed MakeCode tutorial is available here: [https://wiki.dfrobot.com/mbt0044/](https://wiki.dfrobot.com/mbt0044/)

### Initialize, run a motor, and read the battery

Choose motor **M1**, **M2**, **M3**, **M4**, or **all**, a direction (**forward** or **backward**), and a speed from 0 to 255. **read battery percentage** returns the raw battery level from 0 to 255, not a 0–100 percentage. **stop motor** stops one motor or all motors.

```blocks
expansionBoard.initialize()
expansionBoard.controlMotor(expansionBoard.MyEnumMotor.M1, expansionBoard.MyEnumDir.Forward, 128)
basic.showNumber(expansionBoard.readBattery())
basic.pause(1000)
expansionBoard.stopMotor(expansionBoard.MyEnumMotor.M1)
```

### Servos

Servo ports are **S1** to **S4**.

* A 180° standard servo takes an angle from 0 to 180.
* A 360° positional servo takes an angle from 0 to 360.
* A 360° continuous rotation servo takes a direction and a speed from 0 to 100. Use **stop 360 continuous rotation servo** to stop it.

```blocks
expansionBoard.initialize()
expansionBoard.servoStandardRun(expansionBoard.Servos.S1, 90)
expansionBoard.servoPositionalRun(expansionBoard.Servos.S2, 180)
expansionBoard.setContinuousRotation(expansionBoard.Servos.S3, expansionBoard.Servo360Direction.Forward, 50)
basic.pause(1000)
expansionBoard.stopContinuousRotation(expansionBoard.Servos.S3)
```

### Function pins and sensors

Function pins are **C0**, **C1**, and **C2**. Set the pin mode before writing a level or reading a value. Modes are **ADC**, **DHT11**, **DHT22**, **DS18B20**, **digital out**, and **digital in**.

For digital output, set the mode to **digital out**, then write **low** or **high**. For a sensor, set the matching mode, then read the value type you need (analog, digital in, temperature, or humidity).

```blocks
expansionBoard.initialize()
expansionBoard.setPinMode(expansionBoard.PinNumber.C1, expansionBoard.PinMode.WriteGpio)
expansionBoard.setGpioState(expansionBoard.PinNumber.C1, expansionBoard.PinState.High)
expansionBoard.setPinMode(expansionBoard.PinNumber.C0, expansionBoard.PinMode.DHT11)
basic.forever(function () {
    serial.writeLine("T:" + expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DHT11Temperature))
    serial.writeLine("H:" + expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DHT11Humidity))
    basic.pause(1000)
})
```

## License

MIT

Copyright (c) 2026 DFRobot

## Supported targets

* for PXT/microbit
