/**
 * Use this file to define custom functions and graphical blocks.
 * For more details, please visit https://makecode.microbit.org/blocks/custom
 */

/**
 * Building block expansion board: motors, servos, function pins, battery, and temperature/humidity sensors.
 */
//% weight=100 color=#0fbc11 icon="" block="Building Block Expansion Board"
//% groups='["Init","Battery","Function Pin","Servo","Motor"]'
namespace ExpansionBoard {
    /**
     * Motor selection: M1, M2, M3, M4, or ALL.
     */
    export enum MyEnumMotor {
        //% block="M1"
        M1,
        //% block="M2"
        M2,
        //% block="M3"
        M3,
        //% block="M4"
        M4,
        //% block="ALL"
        ALL
    }

    /**
     * Motor direction: Forward or Backward.
     */
    export enum MyEnumDir {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward
    }

    /**
     * Servo port: S1, S2, S3, or S4.
     */
    export enum Servos {
        //% blockId="expansionboard_s1" block="S1"
        S1,
        //% blockId="expansionboard_s2" block="S2"
        S2,
        //% blockId="expansionboard_s3" block="S3"
        S3,
        //% blockId="expansionboard_s4" block="S4"
        S4
    }

    /**
     * Function pin: C0, C1, or C2.
     */
    export enum PinNumber {
        //% block="C0"
        C0 = 0,
        //% block="C1"
        C1 = 1,
        //% block="C2"
        C2 = 2
    }

    /**
     * Pin mode: ADC, DHT11, DHT22, DS18B20, digital out, or digital in.
     */
    export enum PinMode {
        //% block="ADC"
        ADC = 0,
        //% block="DHT11"
        DHT11 = 1,
        //% block="DHT22"
        DHT22 = 2,
        //% block="DS18B20"
        DS18B20 = 3,
        //% block="Digital OUT"
        WriteGpio = 4,
        //% block="Digital IN"
        ReadGpio = 5
    }

    /**
     * Digital pin state: Low or High.
     */
    export enum PinState {
        //% block="low"
        Low = 0,
        //% block="high"
        High = 1
    }

    /**
     * Sensor reading type: analog, digital in, DHT11/DHT22 temperature or humidity, or DS18B20 temperature.
     */
    export enum SensorType {
        //% block="ADC_value"
        Analog = 0,
        //% block="digital in"
        Digital_IN = 1,
        //% block="DHT11Temperature"
        DHT11Temperature = 2,
        //% block="DHT11Humidity"
        DHT11Humidity = 3,
        //% block="DHT22Temperature"
        DHT22Temperature = 4,
        //% block="DHT22Humidity"
        DHT22Humidity = 5,
        //% block="DS18B20Temperature"
        DS18B20Temperature = 6
    }

    /**
     * Continuous rotation servo direction: Forward or Backward.
     */
    export enum Servo360Direction {
        //% block="forward"
        Forward = 1,
        //% block="backward"
        Backward = 2
    }

    const I2CADDR = 0x33;        // I2C device address
    const MAX_RETRIES = 5;       // Maximum retry attempts
    const RETRY_DELAY = 200;     // Retry delay in milliseconds

    // I2C read function with retry mechanism
    function i2cReadWithRetry(address: number, reg: number, length: number): Buffer {
        for (let i = 0; i < MAX_RETRIES; i++) {
            if (getVersion() == 0) {
                pins.i2cWriteNumber(address, reg, NumberFormat.UInt8BE);
                basic.pause(10);
                let buf = pins.i2cReadBuffer(address, length);
                if (buf && buf.length > 0) {
                    return buf;
                }
            }
            basic.pause(RETRY_DELAY);
        }
        return pins.createBuffer(length); // Return zero-filled buffer on failure
    }

    // I2C write function with retry mechanism
    function i2cWriteWithRetry(address: number, buffer: Buffer): boolean {
        for (let i = 0; i < MAX_RETRIES; i++) {
            if (getVersion() == 0) {
                pins.i2cWriteBuffer(address, buffer);
                return true;
            }
            basic.pause(10);
        }
        return false;
    }

    // Get firmware version (used for checking communication status)
    export function getVersion(): number {
        pins.i2cWriteNumber(I2CADDR, 0xF0, NumberFormat.UInt8BE);
        basic.pause(10);
        let buf = pins.i2cReadBuffer(I2CADDR, 1);
        if (buf && buf.length > 0 && buf[0] == 0x10) {
            return 0; // Communication successful
        }
        return -1; // Communication failed
    }

    // Set motor PWM period (used for initialization)
    function setMotorPWMPeriod(): void {
        let buf = pins.createBuffer(5);
        buf[0] = 0x00;
        buf[1] = 0x00;
        buf[2] = 0xFF;
        buf[3] = 0x00;
        buf[4] = 0xFF;
        i2cWriteWithRetry(I2CADDR, buf);
        basic.pause(500);
    }

    /**
     * Initialize the expansion board over I2C and set the motor PWM period.
     */
    //% block="initialize device"
    //% weight=100
    //% group="Init"
    //% help=github:building-block-expansion-board/README
    export function initialize(): void {
        const DATA_ENABLE = 0x01;
        let buf = pins.createBuffer(2);
        buf[0] = 0xa0;  // Command to enable device
        buf[1] = DATA_ENABLE;
        i2cWriteWithRetry(I2CADDR, buf);
        basic.pause(500);
        setMotorPWMPeriod(); // Set initial PWM
    }

    /**
     * Read the battery level from the expansion board (0–255).
     */
    //% block="read battery percentage"
    //% weight=10
    //% group="Battery"
    //% help=github:building-block-expansion-board/README
    export function readBattery(): number {
        let buf = i2cReadWithRetry(I2CADDR, 0x87, 1);
        return buf[0];  // Return battery level (0–255)
    }

    /**
     * Set the working mode of a function pin.
     * @param pin the function pin C0, C1, or C2
     * @param mode pin mode such as ADC, DHT11, or digital out
     */
    //% block="set pin %pin mode %mode"
    //% weight=96
    //% group="Function Pin"
    //% help=github:building-block-expansion-board/README
    export function setPinMode(pin: PinNumber, mode: PinMode): void {
        let buf = pins.createBuffer(2);
        buf[0] = 0x2c + pin;
        buf[1] = mode;
        i2cWriteWithRetry(I2CADDR, buf);
        basic.pause(10); // Delay for initialization
    }

    /**
     * Write a digital high or low level to a function pin.
     * @param pin the function pin C0, C1, or C2
     * @param value Low or High
     */
    //% block="set pin %pin gpio state %value"
    //% weight=95
    //% group="Function Pin"
    //% help=github:building-block-expansion-board/README
    export function setGpioState(pin: PinNumber, value: PinState): void {
        let buf = pins.createBuffer(2);
        buf[0] = 0x39 + pin;
        buf[1] = value;
        i2cWriteWithRetry(I2CADDR, buf);
    }

    /**
     * Read a sensor or pin value. Set the matching pin mode first.
     * @param pin the function pin C0, C1, or C2
     * @param type the value to read, such as analog or DHT11 temperature
     */
    //% block="read pin %pin type %type"
    //% weight=87
    //% group="Function Pin"
    //% help=github:building-block-expansion-board/README
    export function readSensor(pin: PinNumber, type: SensorType): number {
        const DATA_ENABLE = 0x01;
        const MODE_ERROR = 0x02;
        const RETRY_COUNT = 3;

        switch (type) {
            case SensorType.Analog:
                // ADC读取
                let adcBuf = i2cReadWithRetry(I2CADDR, 0x45 + pin * 3, 3);
                if (adcBuf && adcBuf[0] == DATA_ENABLE) {
                    let adcValue = (adcBuf[1] << 8) | adcBuf[2];
                    if (adcValue > 3900) {
                        adcValue = 4095;
                    } else if (adcValue < 40) {
                        adcValue = 0;
                    }
                    return adcValue;
                }
                return 0xFFFF;

            case SensorType.Digital_IN:
                // GPIO读取
                let gpioBuf = i2cReadWithRetry(I2CADDR, 0x3f + pin, 1);
                return gpioBuf ? gpioBuf[0] : 0xFF;

            case SensorType.DHT11Temperature:
                // DHT11温度读取
                let enableBuf = pins.createBuffer(2);
                enableBuf[0] = 0x57 + pin * 5;
                enableBuf[1] = DATA_ENABLE;
                i2cWriteWithRetry(I2CADDR, enableBuf);
                basic.pause(30);
                let dht11TempBuf = i2cReadWithRetry(I2CADDR, 0x57 + pin * 5, 3);
                if (dht11TempBuf && dht11TempBuf[0] == DATA_ENABLE) {
                    let sign = 1.0;
                    if (dht11TempBuf[1] & 0x80) {
                        dht11TempBuf[1] &= 0x7f;
                        sign = -1.0;
                    }
                    return (dht11TempBuf[1] + dht11TempBuf[2] * 0.01) * sign;
                }
                return 0;

            case SensorType.DHT11Humidity:
                // DHT11湿度读取
                enableBuf = pins.createBuffer(2);
                enableBuf[0] = 0x57 + pin * 5;
                enableBuf[1] = DATA_ENABLE;
                i2cWriteWithRetry(I2CADDR, enableBuf);
                basic.pause(30);
                let dht11HumBuf = i2cReadWithRetry(I2CADDR, 0x57 + pin * 5, 5);
                if (dht11HumBuf && dht11HumBuf[0] == DATA_ENABLE) {
                    return dht11HumBuf[3] + dht11HumBuf[4] * 0.01;
                }
                return 0;

            case SensorType.DHT22Temperature:
                // DHT22温度读取
                enableBuf = pins.createBuffer(2);
                enableBuf[0] = 0x57 + pin * 5;
                enableBuf[1] = DATA_ENABLE;
                i2cWriteWithRetry(I2CADDR, enableBuf);
                basic.pause(30);
                let dht22TempBuf = i2cReadWithRetry(I2CADDR, 0x57 + pin * 5, 3);
                if (dht22TempBuf && dht22TempBuf[0] == DATA_ENABLE) {
                    let sign = 1.0;
                    if (dht22TempBuf[1] & 0x80) {
                        dht22TempBuf[1] &= 0x7f;
                        sign = -1.0;
                    }
                    return (dht22TempBuf[1] + dht22TempBuf[2] * 0.01) * sign;
                }
                return 0;

            case SensorType.DHT22Humidity:
                // DHT22湿度读取
                enableBuf = pins.createBuffer(2);
                enableBuf[0] = 0x57 + pin * 5;
                enableBuf[1] = DATA_ENABLE;
                i2cWriteWithRetry(I2CADDR, enableBuf);
                basic.pause(30);
                let dht22HumBuf = i2cReadWithRetry(I2CADDR, 0x57 + pin * 5, 5);
                if (dht22HumBuf && dht22HumBuf[0] == DATA_ENABLE) {
                    return dht22HumBuf[3] + dht22HumBuf[4] * 0.01;
                }
                return 0;

            case SensorType.DS18B20Temperature:
                // DS18B20读取
                enableBuf = pins.createBuffer(2);
                enableBuf[0] = 0x75 + pin * 3;
                enableBuf[1] = DATA_ENABLE;
                i2cWriteWithRetry(I2CADDR, enableBuf);
                basic.pause(100);
                let ds18b20Buf = i2cReadWithRetry(I2CADDR, 0x75 + pin * 3, 3);
                if (ds18b20Buf && ds18b20Buf[0] == DATA_ENABLE) {
                    if (ds18b20Buf[1] == 0xff && ds18b20Buf[2] == 0xff) {
                        return 0.0;
                    }
                    let sign = 1.0;
                    if (ds18b20Buf[1] & 0x80) {
                        ds18b20Buf[1] &= 0x7f;
                        sign = -1.0;
                    }
                    return ((ds18b20Buf[1] * 256 + ds18b20Buf[2]) / 16.0) * sign;
                }
                return 0.0;
            default:
                return 0;
        }
    }

    /**
     * Set a 180° standard servo to an angle.
     * @param servo servo port S1 to S4
     * @param angle target angle, 0 to 180
     */
    //% block="set 180 Standard Servo %index angle %angle"
    //% group="Servo"
    //% weight=90
    //% angle.min=0 angle.max=180
    //% help=github:building-block-expansion-board/README
    export function servoStandardRun(servo: Servos, angle: number): void {
        angle = Math.max(0, Math.min(180, angle)); // Clamp angle
        let period = Math.round(500 + angle * 11.1);
        let buf = pins.createBuffer(3);
        buf[0] = 0x1a + servo * 2;
        buf[1] = period >> 8;
        buf[2] = period & 0xFF;
        i2cWriteWithRetry(I2CADDR, buf);
    }

    /**
     * Set a 360° positional servo to an angle.
     * @param servo servo port S1 to S4
     * @param angle target angle, 0 to 360
     */
    //% block="set 360 Positional Servo %index angle %angle"
    //% group="Servo"
    //% weight=90
    //% angle.min=0 angle.max=360
    //% help=github:building-block-expansion-board/README
    export function servoPositionalRun(servo: Servos, angle: number): void {
        angle = Math.max(0, Math.min(360, angle)); // Clamp angle
        let period = Math.round(500 + angle * 5.55);
        let buf = pins.createBuffer(3);
        buf[0] = 0x1a + servo * 2;
        buf[1] = period >> 8;
        buf[2] = period & 0xFF;
        i2cWriteWithRetry(I2CADDR, buf);
    }
    
    /**
     * Stop a 360° continuous rotation servo.
     * @param servo servo port S1 to S4
     */
    //% block="stop 360 Continuous Rotation Servo %servo"
    //% blockId=stopContinuousRotation
    //% group="Servo"
    //% weight=85
    //% help=github:building-block-expansion-board/README
    export function stopContinuousRotation(servo: Servos): void {
        let period = 1500; // Default stop value
        let buf = pins.createBuffer(3);
        buf[0] = 0x1a + servo * 2;
        buf[1] = (period >> 8) & 0xFF;
        buf[2] = period & 0xFF;
        i2cWriteWithRetry(I2CADDR, buf);
    }

    
    /**
     * Set the direction and speed of a 360° continuous rotation servo.
     * @param servo servo port S1 to S4
     * @param direction Forward or Backward
     * @param speed rotation speed, 0 to 100
     */
    //% block="set 360 Continuous Rotation Servo %servo direction %direction speed %speed"
    //% blockId=setContinuousRotation
    //% group="Servo"
    //% weight=85
    //% speed.min=0 speed.max=100
    //% help=github:building-block-expansion-board/README
    export function setContinuousRotation(servo: Servos, direction: Servo360Direction, speed: number): void {
        speed = Math.max(0, Math.min(100, speed)); // Clamp speed
        let period = 1500; // Default stop value

        if (speed > 0) {
            switch (direction) {
                case Servo360Direction.Forward:
                    period = Math.round(1450 - (speed * 4.5)); // Forward pulse width
                    break;
                case Servo360Direction.Backward:
                    period = Math.round(1550 + (speed * 4.5)); // Backward pulse width
                    break;
                default:
                    period = 1500; // Stop
                    break;
            }
        }
        let buf = pins.createBuffer(3);
        buf[0] = 0x1a + servo * 2;
        buf[1] = (period >> 8) & 0xFF;
        buf[2] = period & 0xFF;
        i2cWriteWithRetry(I2CADDR, buf);
    }

    /**
     * Set the direction and speed of one DC motor or all motors.
     * @param emotor motor M1 to M4, or ALL
     * @param edir Forward or Backward
     * @param speed motor speed, 0 to 255
     */
    //% block="set motor %emotor direction %edir speed %speed"
    //% speed.min=0 speed.max=255
    //% weight=99
    //% group="Motor"
    //% help=github:building-block-expansion-board/README
    export function controlMotor(emotor: MyEnumMotor, edir: MyEnumDir, speed: number): void {
        const MOTOR_CMDS = {
            [MyEnumMotor.M1]: 0x04,
            [MyEnumMotor.M2]: 0x08,
            [MyEnumMotor.M3]: 0x0c,
            [MyEnumMotor.M4]: 0x10
        };

        // Helper function to create motor data buffer
        function createMotorData(cmd: number, dir: MyEnumDir, speed: number): Buffer {
            let buf = pins.createBuffer(5);
            buf[0] = cmd;
            if (dir == MyEnumDir.Forward) {
                buf[1] = 0x00;
                buf[2] = speed;
                buf[3] = 0x00;
                buf[4] = 0x00;
            } else {
                buf[1] = 0x00;
                buf[2] = 0x00;
                buf[3] = 0x00;
                buf[4] = speed;
            }
            return buf;
        }

        if (emotor == MyEnumMotor.ALL) {
            // Send a full 4-motor command
            let ALLBuf = pins.createBuffer(17);
            ALLBuf[0] = 0x04;
            for (let i = 0; i < 4; i++) {
                const offset = i * 4 + 1;
                if (edir == MyEnumDir.Forward) {
                    ALLBuf[offset] = 0x00;
                    ALLBuf[offset + 1] = speed;
                    ALLBuf[offset + 2] = 0x00;
                    ALLBuf[offset + 3] = 0x00;
                } else {
                    ALLBuf[offset] = 0x00;
                    ALLBuf[offset + 1] = 0x00;
                    ALLBuf[offset + 2] = 0x00;
                    ALLBuf[offset + 3] = speed;
                }
            }
            i2cWriteWithRetry(I2CADDR, ALLBuf);
        } else {
            let cmd = MOTOR_CMDS[emotor];
            let buf = createMotorData(cmd, edir, speed);
            i2cWriteWithRetry(I2CADDR, buf);
        }
    }
    
    /**
     * Stop one DC motor or all motors.
     * @param emotor motor M1 to M4, or ALL
     */
    //% block="stop motor %emotor"
    //% weight=98
    //% group="Motor"
    //% help=github:building-block-expansion-board/README
    export function stopMotor(emotor: MyEnumMotor): void {
        const MOTOR_CMDS = {
            [MyEnumMotor.M1]: 0x04,
            [MyEnumMotor.M2]: 0x08,
            [MyEnumMotor.M3]: 0x0c,
            [MyEnumMotor.M4]: 0x10
        };

        if (emotor == MyEnumMotor.ALL) {
            // 停止所有电机
            let ALLBuf = pins.createBuffer(17);
            ALLBuf[0] = 0x04; // 与 controlMotor ALL 保持一致
            for (let i = 0; i < 4; i++) {
                const offset = i * 4 + 1;
                ALLBuf[offset] = 0x00;
                ALLBuf[offset + 1] = 0x00;
                ALLBuf[offset + 2] = 0x00;
                ALLBuf[offset + 3] = 0x00;
            }
            i2cWriteWithRetry(I2CADDR, ALLBuf);
        } else {
            // 停止单个电机
            let cmd = MOTOR_CMDS[emotor];
            let buf = pins.createBuffer(5);
            buf[0] = cmd;
            buf[1] = 0x00;
            buf[2] = 0x00;
            buf[3] = 0x00;
            buf[4] = 0x00;
            i2cWriteWithRetry(I2CADDR, buf);
        }
    }

}
