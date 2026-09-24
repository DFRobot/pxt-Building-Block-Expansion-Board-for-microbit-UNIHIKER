serial.writeLine("TEST START I2C=0x33")

// TEST: initialize
// Method: Call initialize() once at start to enable the board and set motor PWM period.
// Expected: I2C writes succeed; later motor/servo/pin commands are accepted.
// Pass: No hang; subsequent tests produce I2C responses or mechanical motion.
// Fail: Device never responds; later reads stay at error sentinels (0, 0xFF, 0xFFFF).
expansionBoard.initialize()
basic.pause(500)

// TEST: readBattery
// Method: Read battery register after initialize; print value to serial and LED.
// Expected: Integer in 0–255 (firmware raw level).
// Pass: Value is 0–255 and changes with supply (or is stable on a charged pack).
// Fail: Always 0 after retries, or value outside 0–255.
let battery = expansionBoard.readBattery()
serial.writeLine("battery=" + battery)
basic.showNumber(battery)
basic.pause(200)

// TEST: setPinMode (ADC) + readSensor (Analog)
// Method: Set C0 to ADC, then read analog value.
// Expected: 0–4095 after clamp; 0xFFFF if ADC enable flag missing.
// Pass: Value in 0–4095 and follows a voltage on C0.
// Fail: Always 0xFFFF, or no change when C0 input voltage changes.
expansionBoard.setPinMode(expansionBoard.PinNumber.C0, expansionBoard.PinMode.ADC)
basic.pause(50)
let adc = expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.Analog)
serial.writeLine("adc_C0=" + adc)
basic.pause(200)

// TEST: setPinMode (Digital OUT) + setGpioState
// Method: Set C1 to digital out, write High then Low.
// Expected: Pin C1 drives high then low.
// Pass: Logic probe / LED on C1 follows High then Low.
// Fail: Pin stays floating or stuck; no level change.
expansionBoard.setPinMode(expansionBoard.PinNumber.C1, expansionBoard.PinMode.WriteGpio)
basic.pause(20)
expansionBoard.setGpioState(expansionBoard.PinNumber.C1, expansionBoard.PinState.High)
basic.pause(500)
expansionBoard.setGpioState(expansionBoard.PinNumber.C1, expansionBoard.PinState.Low)
basic.pause(200)

// TEST: setPinMode (Digital IN) + readSensor (Digital_IN)
// Method: Set C2 to digital in, read level.
// Expected: 0 or 1 (or 0xFF on I2C fail).
// Pass: Reading matches the level applied to C2.
// Fail: Always 0xFF, or opposite of the applied level.
expansionBoard.setPinMode(expansionBoard.PinNumber.C2, expansionBoard.PinMode.ReadGpio)
basic.pause(20)
let din = expansionBoard.readSensor(expansionBoard.PinNumber.C2, expansionBoard.SensorType.Digital_IN)
serial.writeLine("din_C2=" + din)
basic.pause(200)

// TEST: setPinMode (DHT11) + readSensor (DHT11 temperature / humidity)
// Method: Set C0 to DHT11, read temperature then humidity.
// Expected: Plausible room values (temp typically -40–80, humidity 0–100).
// Pass: Both readings are finite numbers in sensor range and update.
// Fail: Always 0 with no sensor, or wildly out of range.
expansionBoard.setPinMode(expansionBoard.PinNumber.C0, expansionBoard.PinMode.DHT11)
basic.pause(50)
let dht11t = expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DHT11Temperature)
let dht11h = expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DHT11Humidity)
serial.writeLine("dht11_t=" + dht11t)
serial.writeLine("dht11_h=" + dht11h)
basic.pause(200)

// TEST: setPinMode (DHT22) + readSensor (DHT22 temperature / humidity)
// Method: Set C0 to DHT22, read temperature then humidity.
// Expected: Same as DHT11 but DHT22 precision; 0 if sensor missing.
// Pass: Values in DHT22 range when a DHT22 is wired to C0.
// Fail: Always 0 with a connected DHT22, or garbage with no pause after mode set.
expansionBoard.setPinMode(expansionBoard.PinNumber.C0, expansionBoard.PinMode.DHT22)
basic.pause(50)
let dht22t = expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DHT22Temperature)
let dht22h = expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DHT22Humidity)
serial.writeLine("dht22_t=" + dht22t)
serial.writeLine("dht22_h=" + dht22h)
basic.pause(200)

// TEST: setPinMode (DS18B20) + readSensor (DS18B20Temperature)
// Method: Set C0 to DS18B20, read temperature.
// Expected: Celsius from 1-wire sensor; 0.0 on 0xFF/0xFF raw or I2C fail.
// Pass: Temperature near ambient when DS18B20 is on C0.
// Fail: Always 0.0 with a connected sensor after 100 ms conversion window.
expansionBoard.setPinMode(expansionBoard.PinNumber.C0, expansionBoard.PinMode.DS18B20)
basic.pause(50)
let ds18 = expansionBoard.readSensor(expansionBoard.PinNumber.C0, expansionBoard.SensorType.DS18B20Temperature)
serial.writeLine("ds18b20_t=" + ds18)
basic.pause(200)

// TEST: servoStandardRun
// Method: Drive S1 180° standard servo to 90°.
// Expected: Pulse ~1500 us; horn moves to mid angle.
// Pass: S1 horn settles near 90°.
// Fail: No motion, or servo buzzes at stop/end stop.
expansionBoard.servoStandardRun(expansionBoard.Servos.S1, 90)
basic.pause(800)

// TEST: servoPositionalRun
// Method: Drive S2 360° positional servo to 180°.
// Expected: Pulse mapped 0–360°; horn moves to 180°.
// Pass: S2 reaches about half rotation from 0.
// Fail: No motion, or angle does not match 180°.
expansionBoard.servoPositionalRun(expansionBoard.Servos.S2, 180)
basic.pause(800)

// TEST: setContinuousRotation
// Method: Run S3 360° continuous servo forward at speed 50.
// Expected: Pulse below 1500 us; shaft rotates forward continuously.
// Pass: S3 spins forward at a medium speed.
// Fail: Stopped, reverse, or speed ignores 50.
expansionBoard.setContinuousRotation(expansionBoard.Servos.S3, expansionBoard.Servo360Direction.Forward, 50)
basic.pause(1000)

// TEST: stopContinuousRotation
// Method: Stop S3 after the forward run (1500 us stop pulse).
// Expected: Shaft stops.
// Pass: S3 stops within a short time after the call.
// Fail: Continues spinning.
expansionBoard.stopContinuousRotation(expansionBoard.Servos.S3)
basic.pause(500)

// TEST: controlMotor (single)
// Method: Run M1 forward at speed 128.
// Expected: M1 PWM forward channel 128, reverse 0.
// Pass: M1 spins forward at about half speed.
// Fail: No spin, wrong direction, or other motors also start.
expansionBoard.controlMotor(expansionBoard.MyEnumMotor.M1, expansionBoard.MyEnumDir.Forward, 128)
basic.pause(800)

// TEST: stopMotor (single)
// Method: Stop M1 only.
// Expected: M1 PWM all zeros; M2–M4 unchanged by this call.
// Pass: M1 stops; other motors (if previously off) stay off.
// Fail: M1 keeps running, or all motors stop unexpectedly.
expansionBoard.stopMotor(expansionBoard.MyEnumMotor.M1)
basic.pause(400)

// TEST: controlMotor (ALL)
// Method: Run all motors backward at speed 128.
// Expected: Four-motor frame starting at cmd 0x04, reverse speed 128 each.
// Pass: M1–M4 all spin backward.
// Fail: Only one motor moves, or direction is forward.
expansionBoard.controlMotor(expansionBoard.MyEnumMotor.ALL, expansionBoard.MyEnumDir.Backward, 128)
basic.pause(800)

// TEST: stopMotor (ALL)
// Method: Stop all motors.
// Expected: Four-motor zero PWM frame.
// Pass: M1–M4 all stop.
// Fail: Any motor keeps running.
expansionBoard.stopMotor(expansionBoard.MyEnumMotor.ALL)
basic.pause(200)

serial.writeLine("TEST END")
basic.showIcon(IconNames.Yes)
