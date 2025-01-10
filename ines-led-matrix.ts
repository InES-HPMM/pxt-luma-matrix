/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    ines-led-matrix.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    08.01.2025
 * -- Author:   vore, hesu, ebep
 * --
 * ------------------------------------------------------------------
 */


//% color=#3162a3 icon="\uf00a" block="Lumatrix"
namespace Lumatrix {

    /* GLOBAL VARIABLES */
    export let strip: neopixel.Strip;
    let matrixWidth = 8; // x
    let matrixHeight = 8; // y
    export let currentBrightness = 100; // 0 to 255
    export let pollingInterval = 10 // 10ms Interval for polling LED Matrix Interface. Adjust the polling interval as needed.
    let pinSwitch: DigitalPin = DigitalPin.P1;
    let pinCenterButton: DigitalPin = DigitalPin.P2;
    let pinUpButton: DigitalPin = DigitalPin.P9;
    let pinDownButton: DigitalPin = DigitalPin.P16;
    let pinRightButton: DigitalPin = DigitalPin.P8;
    let pinLeftButton: DigitalPin = DigitalPin.P12;
    let counter = 0;
    let lastSwitchValue = readSwitch(); // used for switchValueChanged
    let lastJoystickDirection: eJoystickDirection = eJoystickDirection.NotPressed; // used for joystickDirectionChanged
    let result: number[][] = [];
    let binaryArray: number[] = [];
    let finalResult: number[][] = [];
    let output: number[][] = [];
    let charData: number[] = [];
    let charMatrix: number[][] = [];
    let im: Image;
    let textArray: number[][] = [];
    let totalWidth: number = 0;
    let index: number = 0;
    let debugEnabled: boolean = false;
    let pixelBuffer: Buffer = Buffer.create(3*8*8)


    /* FUNCTIONS */

    function isValidString(input: string): string {
        const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?():;".split(''); // TODO if problems use let instead of const
        let result = '';

        for (let i = 0; i < input.length; i++) {
            if (allowedChars.indexOf(input[i]) !== -1) {
                result += input[i];
            } else {
                result += ' ';
            }
        }

        return result;
    }

    //% blockId="Debug_Enable"
    //% block="set serial debugging prints to $enable"
    //% enable.shadow="toggleOnOff"
    //% advanced=true group="Debug"
    export function debugEnable(enable: boolean): void {
        debugEnabled = enable;
    }

    export function serialDebugMsg(message: string): void {
        if (debugEnabled) {
            serial.writeLine(message);
        }
    }

    function getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function linearizeInt(input: number, minInput: number, maxInput: number, lowerOutputRangeLimit: number, upperOutputRangeLimit: number): number {
        /* Calculate the factor of the input value to the allowed range. */
        let factor = (input - minInput) / (maxInput - minInput);
        /* Calculate the scaled value */
        return lowerOutputRangeLimit + factor * (upperOutputRangeLimit - lowerOutputRangeLimit);
    }

    //% blockId="Matrix_Init"
    //% block="initialize Lumatrix with pin $pin and brightness $brightness"
    //% brightness.defl=127 brightness.min=0 brightness.max=255
    //% group="Pixels" weight=120
    export function initializeMatrix(pin: DigitalPin = DigitalPin.P0, brightness: number): void {
        serial.setBaudRate(BaudRate.BaudRate115200)
        serial.redirectToUSB();

        currentBrightness = brightness;
        strip = neopixel.create(pin, matrixWidth * matrixHeight, NeoPixelMode.RGB);
        strip.setBrightness(brightness);
        clear();
        initializeMatrixInterface();
        control.inBackground(function () {
            while (true) {
                calculateCurrentTime();
            }
        });
        serialDebugMsg("initializeMatrix: Matrix init on pin: " + pin + " with brightness: " + brightness);
    }

    function initializeMatrixInterface(): void {
        pins.setPull(pinSwitch, PinPullMode.PullUp);
        pins.setPull(pinCenterButton, PinPullMode.PullUp);
        pins.setPull(pinUpButton, PinPullMode.PullUp);
        pins.setPull(pinDownButton, PinPullMode.PullUp);
        pins.setPull(pinRightButton, PinPullMode.PullUp);
        pins.setPull(pinLeftButton, PinPullMode.PullUp);
        serialDebugMsg("initializeMatrixInterface: pinSwitch: " + pinSwitch + ", pinCenterButton:" + pinCenterButton + ", pinUpButton: " + pinUpButton + ", pinDownButton: " + pinDownButton + ", pinRightButton:" + pinRightButton + ", pinLeftButton: " + pinLeftButton);
    }

    /**
     * This function allows to use custom pins for the input devices.
     * @param pinSwitchTemp is the GPIO pin for the switch
     * @param pinCenterButtonTemp is the GPIO pin for the center button of the joystick
     * @param pinUpButtonTemp is the GPIO pin for the up button of the joystick
     * @param pinDownButtonTemp is the GPIO pin for the down button of the joystick
     * @param pinRightButtonTemp is the GPIO pin for the right button of the joystick
     * @param pinLeftButtonTemp is the GPIO pin for the left button of the joystick
    */
    //% blockId="Matrix_InitExpert"
    //% block="initialize LED Matrix Interface (Expert). \nSwitch pin $pinSwitchTemp \nCenter button pin $pinCenterButtonTemp \nUp button pin $pinUpButtonTemp \nDown button pin $pinDownButtonTemp \nRight button pin $pinRightButtonTemp \nLeft button pin $pinLeftButtonTemp"
    //% advanced=true group="Debug"
    export function initializeMatrixInterfaceExpert(
        pinSwitchTemp: DigitalPin,
        pinCenterButtonTemp: DigitalPin,
        pinUpButtonTemp: DigitalPin,
        pinDownButtonTemp: DigitalPin,
        pinRightButtonTemp: DigitalPin,
        pinLeftButtonTemp: DigitalPin
    ): void {
        pinSwitch = pinSwitchTemp;
        pinCenterButton = pinCenterButtonTemp;
        pinUpButton = pinUpButtonTemp;
        pinDownButton = pinDownButtonTemp;
        pinRightButton = pinRightButtonTemp;
        pinLeftButton = pinLeftButtonTemp;

        pins.setPull(pinSwitch, PinPullMode.PullUp);
        pins.setPull(pinCenterButton, PinPullMode.PullUp);
        pins.setPull(pinUpButton, PinPullMode.PullUp);
        pins.setPull(pinDownButton, PinPullMode.PullUp);
        pins.setPull(pinRightButton, PinPullMode.PullUp);
        pins.setPull(pinLeftButton, PinPullMode.PullUp);
        basic.pause(5); // Wait 5ms for pull-up to take effect
        serialDebugMsg("initializeMatrixInterface: pinSwitch: " + pinSwitch + ", pinCenterButton:" + pinCenterButton + ", pinUpButton: " + pinUpButton + ", pinDownButton: " + pinDownButton + ", pinRightButton:" + pinRightButton + ", pinLeftButton: " + pinLeftButton);
    }

    //% blockId="Matrix_Clear"
    //% block="clear Matrix"
    //% group="Pixels" weight=110
    export function clear(): void {
        if (strip) {
            strip.clear();
            strip.show();
            pixelBuffer.fill(0)
        }
    }

    //% blockId="Matrix_Brightness"
    //% block="set Brightness $brightness"
    //% brightness.defl=127 brightness.min=0 brightness.max=255
    //% group="Pixels" weight=109
    export function setBrightness(brightness: number): void {
        currentBrightness = brightness;
        strip.setBrightness(brightness);
        strip.show();
        serialDebugMsg(`setBrightness: Brightness is set to = ${brightness}`);
    }

    export function setPixel(x: number, y: number, color: number): void {
        if (strip) {
            if (color < 0 || color > 16777215) {
                serialDebugMsg("setPixel: Error color value out of range");
                color = 16777215;
            }
            if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
                index = (matrixHeight - 1 - y) * matrixWidth + x; // (y)* 8 + x;
                strip.setPixelColor(index, color);
                pixelBuffer.setUint8(3 * index + 0, (color >> 16) & 0xff)
                pixelBuffer.setUint8(3 * index + 1, (color >> 8) & 0xff)
                pixelBuffer.setUint8(3 * index + 2, (color >> 0) & 0xff)
                // serialDebugMsg("setPixel: set pixel(" + x + "," + y + ") to = #" + color);
            } else {
                serialDebugMsg("setPixel: Error pixel out of range");
            }
        }
    }

    //% blockId="Matrix_SetPixelColor"
    //% block="set one pixel at x $x y $y to color $color"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% color.shadow="colorNumberPicker"
    //% group="Pixels" weight=108
    export function setOnePixel(x: number, y: number, color: number): void {
        setPixel(x, y, color);
        strip.show();
        serialDebugMsg("setOnePixel: Pixel: " + x + "," + y + " is set to color: " + color);
    }

    //% blockId="Matrix_SetPixelRGB"
    //% block="set one pixel at | x: $x y: $y to RGB colors | R: $R G: $G B: $B"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    //% group="Pixels" weight=107
    //% blockExternalInputs=true
    export function setOnePixelRGB(x: number, y: number, R: number, G: number, B: number): void {
        R = Math.max(0, Math.min(255, R));
        G = Math.max(0, Math.min(255, G));
        B = Math.max(0, Math.min(255, B));
        let color = neopixel.rgb(R, G, B);
        setPixel(x, y, color);
        strip.show();
        serialDebugMsg("setOnePixel: Pixel: " + x + "," + y + " is set to color(R,G,B): (" + R + "," + G + "," + B + ")");
    }

    //% blockId="Matrix_GetMatrixImage"
    //% block="Get Image from Matrix"
    //% group="Pixels" weight=106
    export function getMatrixImage(): Image {
        let img = images.createImage(`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `); // Initialize an 8x8 image

        try {
            let imagewidth = img.width();
            let imageheight = img.height();

            for (let y = 0; y < imageheight; y++) {
                for (let x = 0; x < imagewidth; x++) {
                    let index = (matrixHeight - 1 - y) * matrixWidth + x;
                    if (pixelBuffer.getUint8(3 * index + 0) || pixelBuffer.getUint8(3 * index + 1) || pixelBuffer.getUint8(3 * index + 2)) {
                        img.setPixel(x, y, true); // Set the pixel if the bit is 1
                    } else {
                        img.setPixel(x, y, false); // Clear the pixel if the bit is 0
                    }
                }
            }
        } catch (e) {
            console.log(`bufferToBitmap error: ${e}`);
        }

        return img;
    }

    //% blockId="Matrix_GetPixelRGB"
    //% block="Get Color at Pixel x: $x y: $y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% group="Pixels" weight=106
    export function getColorFromPixel(x: number, y: number): number {
        let color = 0x000000;
        let index = (matrixHeight - 1 - y) * matrixWidth + x;
        if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
            color |= pixelBuffer.getUint8(index * 3 + 0) << 16;
            color |= pixelBuffer.getUint8(index * 3 + 1) << 8;
            color |= pixelBuffer.getUint8(index * 3 + 2) << 0;
            serialDebugMsg("color is" + color)
        }
        return color
    }

    //% blockId="Matrix_AddPixelRGB"
    //% block="Add R: $R G: $G B: $B to pixel at x: $x y: $y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    //% group="Pixels" weight=105
    //% blockExternalInputs=true
    export function addColorToPixel(x: number, y: number, R: number, G: number, B: number) {
        let index = (matrixHeight - 1 - y) * matrixWidth + x;
        if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
            R = Math.max(0, Math.min(255, pixelBuffer.getUint8(index * 3 + 0) + R));
            G = Math.max(0, Math.min(255, pixelBuffer.getUint8(index * 3 + 1) + G));
            B = Math.max(0, Math.min(255, pixelBuffer.getUint8(index * 3 + 2) + B));
        }
        setOnePixelRGB(x, y, R, G, B);
    }

    //% blockId="Matrix_SubtractPixelRGB"
    //% block="Subtract R: $R G: $G B: $B from pixel at x: $x y: $y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    //% group="Pixels" weight=105
    //% blockExternalInputs=true
    export function subtractColorFromPixel(x: number, y: number, R: number, G: number, B: number) {
        let index = (matrixHeight - 1 - y) * matrixWidth + x;
        if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
            R = Math.max(0, Math.min(255, pixelBuffer.getUint8(index * 3 + 0) - R));
            G = Math.max(0, Math.min(255, pixelBuffer.getUint8(index * 3 + 1) - G));
            B = Math.max(0, Math.min(255, pixelBuffer.getUint8(index * 3 + 2) - B));
        }
        setOnePixelRGB(x, y, R, G, B);
    }

    //% blockId="Input_GPIORead"
    //% block="read GPIO $pin"
    //% group="Input"
    export function readGPIO(pin: DigitalPin): number { // Function not really needed, just for debugging
        let value = pins.analogReadPin(pin);
        serialDebugMsg("readGPIO: GPIO: " + pin + " Value: " + value);
        return value;
    }

    //% blockId="Input_SwitchRead"
    //% block="read switch value"
    //% group="Input"
    export function readSwitch(): number {
        return pins.digitalReadPin(pinSwitch);
    }

    //% blockId="Input_SwitchReadBool"
    //% block="Switch is set"
    //% group="Input"
    export function isSwitchSet(): boolean {
        return (pins.digitalReadPin(pinSwitch) != 0);
    }

    /* Creates thread to poll switch value and execute callback when value changes. */
    //% blockId="Input_SwitchCallback"
    //% block="when switch value changed"
    //% group="Input"
    export function switchValueChangedThread(callback: () => void): void {
        control.inBackground(() => {
            let currentSwitchValue = 0;
            while (true) {
                currentSwitchValue = pins.digitalReadPin(pinSwitch);
                if (currentSwitchValue !== lastSwitchValue) {
                    lastSwitchValue = currentSwitchValue;
                    callback();
                }
                basic.pause(pollingInterval);
            }
        });
    }

    //% blockId="Input_JoystickRead"
    //% block="read joystick direction"
    //% group="Input"
    export function readJoystick(): number {
        if (pins.digitalReadPin(pinCenterButton) == 0) {
            return eJoystickDirection.Center;
        } else if (pins.digitalReadPin(pinUpButton) == 0) {
            return eJoystickDirection.Up;
        } else if (pins.digitalReadPin(pinDownButton) == 0) {
            return eJoystickDirection.Down;
        } else if (pins.digitalReadPin(pinRightButton) == 0) {
            return eJoystickDirection.Right;
        } else if (pins.digitalReadPin(pinLeftButton) == 0) {
            return eJoystickDirection.Left;
        } else {
            return eJoystickDirection.NotPressed;
        }
    }

    //% blockId="Input_JoystickReadStr"
    //% block="read joystick direction as text"
    //% group="Input"
    export function readJoystickText(): string {
        if (pins.digitalReadPin(pinCenterButton) == 0) {
            return "Center\n";
        } else if (pins.digitalReadPin(pinUpButton) == 0) {
            return "Up\n";
        } else if (pins.digitalReadPin(pinDownButton) == 0) {
            return "Down\n";
        } else if (pins.digitalReadPin(pinRightButton) == 0) {
            return "Right\n";
        } else if (pins.digitalReadPin(pinLeftButton) == 0) {
            return "Left\n";
        } else {
            return "NotPressed\n";
        }
    }

    //% blockId="Input_JoystickCompare"
    //% block="$joystick == $direction"
    //% joystick.shadow="Input_JoystickRead"
    //% direction.defl=eJoystickDirection.Center
    //% group="Input"
    export function compareJoystick(joystick: number, direction: eJoystickDirection): boolean {
        return joystick === direction;
    }

    /* Creates thread to poll joystick direction and execute callback when direction changes. */
    //% block="Input_JoystickCallback"
    //% block="when joystick changed"
    //% draggableParameters="reporter"
    //% group="Input"
    export function joystickChangedThread(callback: (direction: number) => void): void {
        control.inBackground(() => {
            let currentJoystickDirection: eJoystickDirection = eJoystickDirection.NotPressed;
            while (true) {
                currentJoystickDirection = readJoystick();
                if (lastJoystickDirection !== currentJoystickDirection) {
                    lastJoystickDirection = currentJoystickDirection;
                    serialDebugMsg("joystickChangedThread: Joystick direction changed to: " + currentJoystickDirection);
                    callback(currentJoystickDirection);
                }
                basic.pause(pollingInterval);
            }
        });
    }

    /* Creates thread to poll joystick direction and execute callback when direction changes. */
    /* TODO #BUG when using multiple joystickDirectionThread blocks and the callback function do not finish before executing the other joystickDirectionThread block, microbit crashes. */
    //% blockId="Input_JoystickCallbackDir"
    //% block="when joystick direction: %direction"
    //% direction.defl=eJoystickDirection.Center
    //% group="Input"
    export function joystickDirectionThread(direction: eJoystickDirection, callback: () => void): void {
        serialDebugMsg("joystickDirectionThread: Selected trigger direction: " + direction);
        basic.pause(getRandomInt(1, 100)); // Wait 1 to 100ms to asynchron threads
        control.inBackground(() => {
            let lastJoystickDirectionLocal: eJoystickDirection = eJoystickDirection.NotPressed; // Local state variable
            let currentJoystickDirection: eJoystickDirection = 0;
            while (true) {
                currentJoystickDirection = readJoystick();
                if (lastJoystickDirectionLocal !== currentJoystickDirection && direction === currentJoystickDirection) {
                    serialDebugMsg("joystickDirectionThread: Joystick direction: " + currentJoystickDirection);
                    callback();
                } else {
                    lastJoystickDirectionLocal = currentJoystickDirection;
                }
                basic.pause(pollingInterval);
            }
        });
    }

    /**
     */
    //% blockId="Image_8x8"
    //% block="Image 8x8"
    //% imageLiteral=1
    //% imageLiteralColumns=8
    //% imageLiteralRows=8
    //% shim=images::createImage
    //% group="Pixels" weight=60
    export function matrix8x8(i: string): Image {
        im = <Image><any>i;
        return im
    }

    //% blockId="Matrix_ImageStatic"
    //% block="show image on Matrix | $image | with color $color"
    //% image.shadow="Image_8x8"
    //% color.shadow="colorNumberPicker"
    //% group="Pixels" weight=70
    export function showImage(image: Image, color: number): void {
        try {
            let imagewidth = image.width();
            let imageheight = image.height();

            for (let x = 0; x < imagewidth; x++) {
                //serialDebugMsg("generating matrix 1");
                for (let y = 0; y < imageheight; y++) {
                    //serialDebugMsg("generating matrix 0");
                    if (image.pixel(x, y)) {
                        setPixel(x, y, color);
                    }
                }
            }
        } catch {
            serialDebugMsg("showImage: Error creating image matrix");
        }
        strip.show();
        im = <Image><any>'';
    }

    //% blockId="Matrix_ImageMoving"
    //% block="show moving image on Matrix | $image with color $color and speed $speed in direction $direction"
    //% image.shadow="Image_8x8"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=10 speed.min=1 speed.max=100
    //% direction.defl=eDirection.Right
    //% group="Pixels" weight=69
    export function movingImage(image: Image, color: number, speed: number, direction: eDirection): void {
        /* Due to a bug the block is always generated with speed of 0. In this case we set it to the slowest speed. */
        if (speed < 1) {
            speed = 1; // slowest speed
        } else if (speed > 100) {
            speed = 100; // fastest speed
        } else {
            speed = 100 - speed; // make 100 the fastest speed
        }
        speed = linearizeInt(speed, 1, 100, 1, 1000) // Convert speed to ms

        try {
            if (direction === eDirection.Left) {
                for (let offset = -matrixWidth; offset <= matrixWidth; offset++) {
                    for (let x = 0; x < matrixWidth; x++) {
                        for (let y = 0; y < matrixHeight; y++) {
                            const PixelOn = image.pixel(x + offset, y);
                            //serialDebugMsg(`Pixel at (${x + offset}, ${y}) is ${PixelOn ? "on" : "off"}`);
                            setPixel(x, y, PixelOn ? color : 0);
                        }
                    }
                    strip.show();
                    basic.pause(speed);
                }
            } else if (direction === eDirection.Right) {
                for (let offset = matrixWidth; offset >= -matrixWidth; offset--) {
                    for (let x = 0; x < matrixWidth; x++) {
                        for (let y = 0; y < matrixHeight; y++) {
                            ;
                            const PixelOn = image.pixel(x + offset, y);
                            //serialDebugMsg(`Pixel at (${x + offset}, ${y}) is ${PixelOn ? "on" : "off"}`);
                            setPixel(x, y, PixelOn ? color : 0);
                        }
                    }
                    strip.show();
                    basic.pause(speed);
                }
            }
        } catch {
            serialDebugMsg("movingImage: Error displaying moving image");
        }
    }

    //% blockId="Matrix_TextScroll"
    //% block="scroll text $text with color $color and speed $speed"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=10 speed.min=1 speed.max=100
    //% group="Pixels" weight=71
    export function scrollText(text: string, color: number, speed: number): void {
        /* Due to a bug the block is always generated with speed of 0. In this case we set it to the slowest speed. */
        if (speed < 1) {
            speed = 1; // slowest speed
        } else if (speed > 100) {
            speed = 100; // fastest speed
        } else {
            speed = 100 - speed; // make 100 the fastest speed
        }
        speed = linearizeInt(speed, 1, 100, 1, 1000) // Convert speed to ms

        if (text.length > 255) {
            text = text.substr(0, 255);
            serialDebugMsg("scrollText: Text is to long, anything longer than 255 is cut off. \n");
        }
        text = isValidString(text); // validate text to only contains allowed symbols
        textArray = getTextArray(text);
        totalWidth = textArray[0].length;
        serialDebugMsg("\nscrollText: beginning Scrolling text: " + text);
        for (let offset = 0; offset < totalWidth; offset++) { // Scrolls text to the left
            for (let x = 0; x < matrixWidth; x++) {
                for (let y = 0; y < matrixHeight; y++) {
                    if (x + offset >= totalWidth) continue;
                    const PixelOn = textArray[y][x + offset] == 1;
                    setPixel(x, y, PixelOn ? color : 0);
                }
            }
            strip.show();
            basic.pause(speed);
        }
        textArray = [];
        serialDebugMsg("scrollText: Scroll Text Completed\n");
    }

    function getTextArray(text: string): number[][] {
        result = [];
        binaryArray = [];
        finalResult = [];
        output = [];
        charData = [];
        charMatrix = [];
        counter += 1;
        //serialDebugMsg("getTextArray: Number of Executions: " + counter);

        /* Create binary array of each */
        for (let i = 0; i < text.length; i++) {
            if (textFont[text[i]]) {
                try {
                    charData = textFont[text[i]];
                } catch {
                    serialDebugMsg("getTextArray: Error getting char Data");
                }

                for (let row of charData) {
                    for (let bit = matrixWidth - 1; bit >= 0; bit--) {
                        try {
                            binaryArray.push((row >> bit) & 1);
                        } catch {
                            serialDebugMsg("getTextArray: Error transforming Array");
                        }
                    }
                    try {
                        charMatrix.push(binaryArray);
                        binaryArray = [];
                    } catch {
                        serialDebugMsg("getTextArray: Error pushing binary Array");
                    }
                }
                //serialDebugMsg("getTextArray: pushed binary")
                try {
                    output = charMatrix[0].map((_, colIndex) => charMatrix.map(row => row[colIndex]));
                    charMatrix = [];
                } catch (err) {
                    serialDebugMsg("getTextArray: Error transposing character matrix");
                }
                try {
                    result = result.concat(output);
                } catch {
                    serialDebugMsg("getTextArray: failed to push char array");
                }
                //serialDebugMsg("getTextArray: pushed zeros");
            } else {
                serialDebugMsg("getTextArray: Error getting char Data");
                finalResult = [[0], [0]];
            }
        }
        //serialDebugMsg("getTextArray: Centering Result");
        try {
            finalResult = result[0].map((_, columnIndex) => result.map(rows => rows[columnIndex]));
        } catch (err) {
            serialDebugMsg("getTextArray: Error transposing final matrix")
        }

        /* Clear arrays to free memory (garbage collector can reclaim memory) */
        result = null;
        binaryArray = null;
        output = null;
        charData = null;
        charMatrix = null;

        //serialDebugMsg("getTextArray: Successfully created text array");
        return finalResult;
    }
    

    

    //% blockId="Debug_MatrixHardware"
    //% block="Test LED matrix hardware"
    //% advanced=true group="Debug"
    export function testLedMatrixHW(): void {
        let oldBrightness: number = currentBrightness

        /* Test LED Matrix */
        basic.showString("LED TEST");
        // scrollText("LED TEST", neopixel.colors(NeoPixelColors.White), 90);
        serialDebugMsg("testLedMatrix: Start testing LED matrix pixels");
        let colorRed = neopixel.rgb(255, 0, 0);
        let colorGreen = neopixel.rgb(0, 255, 0);
        let colorBlue = neopixel.rgb(0, 0, 255);
        setBrightness(255);
        clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                setPixel(x, y, colorGreen);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                setPixel(x, y, colorRed);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                setPixel(x, y, colorBlue);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        setBrightness(oldBrightness);
        serialDebugMsg("testLedMatrix: Finished testing LED matrix pixels");

        /* Test Switch */
        basic.showString("MOVE SLIDER");
        // scrollText("MOVE SLIDER", neopixel.colors(NeoPixelColors.White), 90);
        serialDebugMsg("testLedMatrix: Start testing LED matrix switch");
        /* Set the first pixel to blue during the test. */
        setPixel(0, 0, colorBlue);
        strip.show();
        while (0 !== readSwitch()) {
            basic.pause(pollingInterval);
        }
        while (1 !== readSwitch()) {
            basic.pause(pollingInterval);
        }
        while (0 !== readSwitch()) {
            basic.pause(pollingInterval);
        }
        /* Set the first pixel to green when the test passed. */
        setPixel(0, 0, colorGreen);
        strip.show();
        serialDebugMsg("testLedMatrix: Switch Works");
        // basic.showString("SLIDER OK");
        // scrollText("SLIDER OK", neopixel.colors(NeoPixelColors.White), 90);

        /* Test Joystick */
        basic.showString("MOVE JOYSTICK");
        // scrollText("MOVE JOYSTICK", neopixel.colors(NeoPixelColors.White), 90);
        serialDebugMsg("testLedMatrix: Start testing LED matrix joystick");
        /* Set the first pixel to blue during the test. */
        setPixel(0, 0, colorBlue);
        strip.show();
        while (0 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick NotPressed works");
        while (1 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Center works");
        while (2 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Up works");
        while (3 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Down works");
        while (4 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Right works");
        while (5 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Left works");
        /* Set the first pixel to green when the test passed. */
        setPixel(0, 0, colorGreen);
        strip.show();
        // basic.showString("JOYSTICK OK");
        // scrollText("JOYSTICK OK", neopixel.colors(NeoPixelColors.White), 90);

        serialDebugMsg("testLedMatrix: Finished testing LED matrix");
        basic.showString("ALL OK");
        clear();
        scrollText("ALL OK", neopixel.colors(NeoPixelColors.White), 90);
    }

}
