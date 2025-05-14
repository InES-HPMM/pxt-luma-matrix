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

// TODO use matrixWidth and matrixHeight and figure out how to implement images and handel matrix-luts with these variables size

//% color=#3162a3 icon="\uf00a" block="Luma Matrix"
namespace lumaMatrix {
    
    /* GLOBAL VARIABLES */
    export let strip: neopixel.Strip;
    export let matrixWidth = 8; // x, min 4
    export let matrixHeight = 8; // y, min 4
    export let currentBrightness = 100; // 0 to 255
    export let pollingInterval = 10 // 10ms Interval for polling LED Matrix Interface. Adjust the polling interval as needed.
    let pinNeopixels: DigitalPin = DigitalPin.P0;
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
    // Create buffer using max dimension to ensure sufficient memory regardless of matrix orientation
    let pixelBuffer: Buffer = Buffer.create(3 * Math.max(matrixWidth, matrixHeight) * Math.max(matrixWidth, matrixHeight))


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

    /**
     * Enable serial messages for debugging printed by the Luma Matrix extension.
     */
    //% blockId="ZHAW_Debug_Enable"
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

    /* Helper method to extract RGB components from a color value. */
    export function extractRgb(color: number): { r: number, g: number, b: number } {
        return {
            r: Math.max(0, Math.min(255, (color >> 16) & 0xFF)),
            g: Math.max(0, Math.min(255, (color >> 8) & 0xFF)),
            b: Math.max(0, Math.min(255, color & 0xFF))
        };
    }

    /* Helper method to convert RGB to HSV. */
    export function rgbToHsv(r: number, g: number, b: number): { h: number, s: number, v: number } {
        /* Normalize RGB values to 0-1 */
        const rNorm = r / 255;
        const gNorm = g / 255; 
        const bNorm = b / 255;
        
        /* Find the maximum and minimum RGB values, weird code because makecode max min function only takes two values. */
        const cMax = Math.max(rNorm, Math.max(gNorm, bNorm));
        const cMin = Math.min(rNorm, Math.min(gNorm, bNorm));
        const delta = cMax - cMin;
        
        /* Calculate hue (0-360) */
        let h = 0;
        if (delta === 0) {
            h = 0;
        } else if (cMax === rNorm) {
            h = 60 * (((gNorm - bNorm) / delta) % 6);
        } else if (cMax === gNorm) {
            h = 60 * ((bNorm - rNorm) / delta + 2);
        } else {
            h = 60 * ((rNorm - gNorm) / delta + 4);
        }
        
        /* Make sure hue is in range of 0-360 */
        if (h < 0) {
            h += 360;
        } else if (h > 360) {
            h -= 360;
        }

        /* Calculate saturation and value */
        const s = (cMax === 0) ? 0 : delta / cMax;
        const v = cMax;
        
        return { h, s, v };
    }

    /* Helper method to convert HSV to RGB. */
    export function hsvToRgb(h: number, s: number, v: number): { r: number, g: number, b: number } {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        
        let rPrime = 0, gPrime = 0, bPrime = 0;
        
        if (h >= 0 && h < 60) {
            rPrime = c; gPrime = x; bPrime = 0;
        } else if (h >= 60 && h < 120) {
            rPrime = x; gPrime = c; bPrime = 0;
        } else if (h >= 120 && h < 180) {
            rPrime = 0; gPrime = c; bPrime = x;
        } else if (h >= 180 && h < 240) {
            rPrime = 0; gPrime = x; bPrime = c;
        } else if (h >= 240 && h < 300) {
            rPrime = x; gPrime = 0; bPrime = c;
        } else {
            rPrime = c; gPrime = 0; bPrime = x;
        }
        
        /* Convert back to 0-255 range */
        const r = Math.max(0, Math.min(255, Math.round((rPrime + m) * 255)));
        const g = Math.max(0, Math.min(255, Math.round((gPrime + m) * 255)));
        const b = Math.max(0, Math.min(255, Math.round((bPrime + m) * 255)));
        
        return { r, g, b };
    }

    /**
     * Initialize the 8 by 8 Neopixel Matrix with a joystick. 
     * This block needs to be execute only once at the start.
     */
    //% blockId="ZHAW_Matrix_Init"
    //% block="initialize Luma Matrix with brightness $brightness"
    //% brightness.defl=127 brightness.min=0 brightness.max=255
    //% group="Pixels" weight=120
    export function initializeMatrix(brightness: number): void {
        serial.setBaudRate(BaudRate.BaudRate115200);
        serial.redirectToUSB();

        currentBrightness = brightness;
        if (!strip) {
            strip = neopixel.create(pinNeopixels, matrixWidth * matrixHeight, NeoPixelMode.RGB);
            basic.pause(1);
            if (!strip) {
                serialDebugMsg("initializeMatrix: Critical Error - Failed to create strip");
                basic.pause(1000 * 1000000); // This should never happen if so we do not continue and wait for a long time (1000000 seconds)
                return;
            }
        } else {
            serialDebugMsg("initializeMatrix: Warning - Strip already initialized");
        }
        strip.setBrightness(brightness);
        clear();
        initializeMatrixInterface();
        control.inBackground(function () {
            while (true) {
                calculateCurrentTime();
            }
        });
        serialDebugMsg("initializeMatrix: Matrix init on pin: " + pinNeopixels + " with brightness: " + brightness);
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
     * set custom gpio pins for the input devices. 
     * Note: Initialize matrix first
     * @param pinSwitchTemp is the GPIO pin for the switch
     * @param pinCenterButtonTemp is the GPIO pin for the center button of the joystick
     * @param pinUpButtonTemp is the GPIO pin for the up button of the joystick
     * @param pinDownButtonTemp is the GPIO pin for the down button of the joystick
     * @param pinRightButtonTemp is the GPIO pin for the right button of the joystick
     * @param pinLeftButtonTemp is the GPIO pin for the left button of the joystick
     */
    //% blockId="ZHAW_Matrix_InitExpert"
    //% block="customize input pins (expert). \nswitch pin $pinSwitchTemp \ncenter button pin $pinCenterButtonTemp \nup button pin $pinUpButtonTemp \ndown button pin $pinDownButtonTemp \nright button pin $pinRightButtonTemp \nleft button pin $pinLeftButtonTemp"
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

    /**
     * Clear the pixels of the Luma Matrix
     */
    //% blockId="ZHAW_Matrix_Clear"
    //% block="clear matrix"
    //% group="Pixels" weight=110
    export function clear(): void {
        if (strip) {
            strip.clear();
            strip.show();
            pixelBuffer.fill(0)
        }
    }

    /**
     * Set the brightness of the pixels inside range from 0 to 255.
     */
    //% blockId="ZHAW_Matrix_Brightness"
    //% block="set brightness $brightness"
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
                index = (matrixHeight - 1 - y) * matrixWidth + x;
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

    /**
     * Combine colour channels into a 24 bit colour number
     */
    //% blockId="ZHAW_Matrix_RGBToColor"
    //% block="red $R green $G blue $B"
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255 
    //% group="Pixels" weight=108
    export function rgbToColor(R: number, G: number, B: number): number {
        R = Math.max(0, Math.min(255, R));
        G = Math.max(0, Math.min(255, G));
        B = Math.max(0, Math.min(255, B));
        return neopixel.rgb(R, G, B);
    }

    /**
     * Set colour of pixel a coordinate to a 24 bit color value
     */
    //% blockId="ZHAW_Matrix_SetPixelColor"
    //% block="set pixel at x $x y $y to colour $color"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% color.shadow="colorNumberPicker"
    //% group="Pixels" weight=108
    export function setOnePixel(x: number, y: number, color: number): void {
        setPixel(x, y, color);
        strip.show();
        serialDebugMsg("setOnePixel: Pixel: " + x + "," + y + " is set to colour: " + color);
    }

    /**
     * Set colour of pixel a coordinate to the colour channels
     */
    //% blockId="ZHAW_Matrix_SetPixelRGB"
    //% block="set pixel at | x $x y $y to colour | red $R green $G blue $B"
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

    /**
     * Get a representation of which pixels are turned on. Only bitmap is available without colour information.
     */
    //% blockId="ZHAW_Matrix_GetMatrixImage"
    //% block="image from matrix"
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


    /**
     * Get a representation of which pixels are turned on based on input coordinates. 
     * Only bitmap is available without colour information.
     */
    //% blockId="ZHAW_Matrix_GetImageFromCoordinates"
    //% block="image from $pixels"
    //% group="Pixels" weight=106 advanced=true
    export function getImageFromCoordinates(pixels: number[][]): Image {
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

            for (let i=0; i<pixels.length; i++){
                img.setPixel(pixels[i][0] % imagewidth, pixels[i][1] % imageheight, true); // Set the pixel if the coordinate is present
                /*for (let y = 0; y < imageheight; y++) {
                    for (let x = 0; x < imagewidth; x++) {
                        let index = (matrixHeight - 1 - y) * matrixWidth + x;
                        if (x == pixels[i][0] && y == pixels[i][1]) {
                            img.setPixel(x, y, true); // Set the pixel if the coordinate is present
                        } else {
                            img.setPixel(x, y, false); // Clear the pixel if the bit is 0
                        }
                    }
                }*/
            }
        } catch (e) {
            console.log(`bufferToBitmap error: ${e}`);
        }

        return img;
    }

    /**
     * Get the buffer with stored colours for each pixel. Each pixel uses 3 bytes in order red, green, blue.
     */
    //% blockId="ZHAW_Matrix_GetPixelBuffer"
    //% block="pixel buffer"
    //% group="Pixels" weight=106
    export function getPixelBuffer(): Buffer {
        return pixelBuffer
    }

    /**
     * Write a buffer full of colours to the matrix. Color must be split into 3 successive bytes following order red, green, blue.
     */
    //% blockId="ZHAW_Matrix_ApplyPixelBuffer"
    //% block="apply pixel buffer $buf"
    //% buf.shadow="ZHAW_Matrix_GetPixelBuffer"
    //% group="Pixels" weight=106
    export function applyPixelBuffer(buf: Buffer) {
        const dataLen = buf.length;

        // Ensure buffer length is a multiple of 3
        if (dataLen % 3 !== 0) {
            serialDebugMsg("Error: Buffer length " + dataLen + " is not a multiple of 3.");
            return;
        }
        if (dataLen < 192) {
            serialDebugMsg("Error: Buffer length " + dataLen + " to small.");
            return;
        }

        serialDebugMsg("Applying " + dataLen + " bytes ");

        for (let i = 0; i < dataLen; i += 3) {
            const pixelIndex = Math.floor(i / 3);
            let x = pixelIndex % matrixWidth;
            let y = matrixHeight - 1 - Math.floor(pixelIndex / matrixWidth);

            // Safely pack the color from the buffer
            if (i + 2 < dataLen) {
                const r = buf.getUint8(i + 0);
                const g = buf.getUint8(i + 1);
                const b = buf.getUint8(i + 2);
                const color = (r << 16) | (g << 8) | b;
                setOnePixel(x, y, color);
            } else {
                serialDebugMsg("Error: Incomplete RGB triplet at buffer index " + i);
            }
        }
    }

    /**
     * Get the colour of the pixel at coordinate (x,y)
     */
    //% blockId="ZHAW_Matrix_GetPixelRGB"
    //% block="colour at pixel x $x y $y"
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


    /**
     * Increase the colour intensity of pixel (x,y) with given colours red, green and blue. 
     * Previously applied color value is considered.
     * Intensity will not go above 255.
     */
    //% blockId="ZHAW_Matrix_AddPixelRGB"
    //% block="add red $R green $G blue $B to pixel at x $x y $y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    //% group="Pixels" advanced=true
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


    /**
     * Decrease the colour intensity of pixel (x,y) with given colours red, green and blue. 
     * Previously applied color value is considered.
     * Intensity will not go below 0.
     */
    //% blockId="ZHAW_Matrix_SubtractPixelRGB"
    //% block="subtract red $R green $G blue $B from pixel at x $x y $y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    //% group="Pixels" advanced=true
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

    //% blockId="ZHAW_Input_GPIORead"
    //% block="GPIO $pin"
    //% blockHidden=true // Function not really needed, just for debugging
    //% subcategory="Input"
    export function readGPIO(pin: DigitalPin): number { 
        let value = pins.analogReadPin(pin);
        serialDebugMsg("readGPIO: GPIO: " + pin + " Value: " + value);
        return value;
    }

    /**
     * Read Luma Matrix switch position
     */
    //% blockId="ZHAW_Input_SwitchRead"
    //% block="switch position"
    //% subcategory="Input"
    export function readSwitch(): number {
        return pins.digitalReadPin(pinSwitch);
    }

    /**
     * Compare Luma Matrix switch position
     */
    //% blockId="ZHAW_Input_SwitchReadBool"
    //% block="switch is $state"
    //% state.shadow="toggleOnOff"
    //% subcategory="Input"
    export function isSwitchSet(state: boolean): boolean {
        if(state){
            return (pins.digitalReadPin(pinSwitch) != 0);
        }
        return (pins.digitalReadPin(pinSwitch) == 0);
    }

    /**
     * Creates thread to poll switch state and execute callback when state changes. 
    */
    //% blockId="ZHAW_Input_SwitchCallback"
    //% block="when switch value changed"
    //% draggableParameters="reporter"
    //% subcategory="Input"
    export function switchValueChangedThread(callback: (state: boolean) => void): void {
        control.inBackground(() => {
            let currentSwitchValue = 0;
            while (true) {
                currentSwitchValue = pins.digitalReadPin(pinSwitch);
                if (currentSwitchValue !== lastSwitchValue) {
                    lastSwitchValue = currentSwitchValue;
                    callback(<any>currentSwitchValue)
                }
                basic.pause(pollingInterval);
            }
        });
    }

    /**
     * Read Luma Matrix joystick position
     */
    //% blockId="ZHAW_Input_JoystickRead"
    //% block="joystick direction"
    //% subcategory="Input"
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

    /**
     * Read Luma Matrix joystick position as text
     */
    //% blockId="ZHAW_Input_JoystickReadStr"
    //% block="joystick direction text"
    //% subcategory="Input"
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

    /**
     * Compare Luma Matrix joystick position
     */
    //% blockId="ZHAW_Input_JoystickCompare"
    //% block="$joystick == $direction"
    //% joystick.shadow="ZHAW_Input_JoystickRead"
    //% direction.defl=lumaMatrix.eJoystickDirection.Center
    //% subcategory="Input"
    export function compareJoystick(joystick: number, direction: eJoystickDirection): boolean {
        return joystick === direction;
    }

    /**
     * Creates thread to poll joystick direction and execute callback when direction changes. 
     * The draggable parameter "direction" holds the value which triggered the call
    */
    //% block="Input_JoystickCallback"
    //% block="when joystick changed"
    //% draggableParameters="reporter"
    //% subcategory="Input"
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

    /**
     * Creates thread to poll joystick direction and execute callback when specified direction happens. 
    */
    //% blockId="ZHAW_Input_JoystickCallbackDir"
    //% block="when joystick direction is %direction"
    //% direction.defl=lumaMatrix.eJoystickDirection.Center
    //% subcategory="Input"
    // TODO #BUG when using multiple joystickDirectionThread blocks and the callback function do not finish before executing the other joystickDirectionThread block, microbit crashes.
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
     * Select direction from joystick enum
     */
    //% blockId="ZHAW_IO_JoystickDirectionEnum" 
    //% block="direction $dir"
    //% dir.defl=lumaMatrix.eJoystickDirection.Center
    //% subcategory="Input"
    export function getJoystickDirectionEnum(dir: eJoystickDirection): number {
        return dir
    }

    /**
     * 8 by 8 matrix bitmap
     */
    //% blockId="ZHAW_Image_8x8"
    //% block="image 8x8"
    //% imageLiteral=1
    //% imageLiteralColumns=8
    //% imageLiteralRows=8
    //% shim=images::createImage
    //% group="Pixels" weight=60
    export function matrix8x8(i: string): Image {
        im = <Image><any>i;
        return im
    }

    /**
     * Write bitmap of pixels in defined colour to the matrix.
     * layer is true by default and will not clear unset pixels.
     */
    //% blockId="ZHAW_Matrix_ImageStatic"
    //% block="show image on matrix | $image | with colour $color || layer $layer"
    //% image.shadow="ZHAW_Image_8x8"
    //% color.shadow="colorNumberPicker"
    //% layer.defl=true
    //% layer.shadow="toggleOnOff"
    //% group="Pixels" weight=70
    export function showImage(image: Image, color: number, layer?: boolean): void {
        try {
            let imagewidth = image.width();
            let imageheight = image.height();

            for (let x = 0; x < imagewidth; x++) {
                //serialDebugMsg("generating matrix 1");
                for (let y = 0; y < imageheight; y++) {
                    //serialDebugMsg("generating matrix 0");
                    if (image.pixel(x, y)) {
                        setPixel(x, y, color);
                    } else if (layer == false){
                        setPixel(x, y, 0x000000);
                    }
                }
            }
        } catch {
            serialDebugMsg("showImage: Error creating image matrix");
        }
        strip.show();
        im = <Image><any>'';
    }

    /**
     * Let image scroll across the matrix, row by row from right to the left.
     */
    //% blockId="ZHAW_Matrix_ImageMoving"
    //% block="show moving image on matrix | $image with colour $color and speed $speed in direction $direction"
    //% image.shadow="ZHAW_Image_8x8"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=10 speed.min=1 speed.max=99
    //% direction.defl=lumaMatrix.eDirection.Right
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
    
    /**
     * Show an ASCII character on the Matrix. Only the first letter of the text string is shown.
     */
    //% blockId="ZHAW_Matrix_Text"
    //% block="show character $text in $color"
    //% color.shadow="colorNumberPicker"
    //% group="Pixels" weight=72
    export function showASCIICharacter(text: string, color: number): void {
        text = isValidString(text); // validate text to only contains allowed symbols
        textArray = getTextArray(text[0]);
        totalWidth = textArray[0].length;
        for (let x = 0; x < matrixWidth; x++) {
            for (let y = 0; y < matrixHeight; y++) {
                if (x >= totalWidth) continue;
                const PixelOn = textArray[y][x] == 1;
                setPixel(x, y, PixelOn ? color : 0);
            }
        }
        strip.show();
    }


    /**
     * Let text scroll across the Luma Matrix pixels.
     */
    //% blockId="ZHAW_Matrix_TextScroll"
    //% block="scroll text $text with colour $color and speed $speed"
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

        if (text.length < 1){
            serialDebugMsg("scrollText: Text is empty. \n");
            return
        }

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
    

    
    /**
     * Defined test sequence which checks every aspect of the hardware. 
     */
    //% blockId="ZHAW_Debug_MatrixHardware"
    //% block="test LED matrix hardware"
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
        for (let y = 0; y < matrixHeight; y++) {
            for (let x = 0; x < matrixWidth; x++) {
                setPixel(x, y, colorGreen);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        for (let y = 0; y < matrixHeight; y++) {
            for (let x = 0; x < matrixWidth; x++) {
                setPixel(x, y, colorRed);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        for (let y = 0; y < matrixHeight; y++) {
            for (let x = 0; x < matrixWidth; x++) {
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
