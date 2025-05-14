/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    wordclock.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    08.01.2025
 * -- Author:   hesu, ebep
 * --
 * ------------------------------------------------------------------
 */
namespace lumaMatrix {

    let wordClock: WordClock;
    const startTime = control.millis();
    let currentTimeSeconds: number = 0;
    const timeUpdateInterval: number = 1; // in seconds
    let timeUpdateIntervalCounter = 0;
    let isUpdatingTime: boolean = false;
    let missedTimeUpdates: number = 0;
    let wordClockDisplayUpdateInterval = 0.1; // in seconds
    const rainbowSpeedColor: number = 2; // increments color (h value of HSV) by this number every wordClockDisplayUpdateInterval
    let joystickTimeSetEnable = false;
    let icons: number[] = [0, 0, 0, 0]

    /* Function to calculate the current time, needs to be run in the background. */
    export function calculateCurrentTime(): void {
        /* Calculate the next wake-up time. */
        let nextWakeUpTime = startTime + timeUpdateInterval * 1000 * timeUpdateIntervalCounter;

        /* Sleep until the next wake-up time. */
        sleepUntil(nextWakeUpTime);
        if (!isUpdatingTime) { // Mutex to prevent updating time while it is being calculated
            isUpdatingTime = true;
            currentTimeSeconds = currentTimeSeconds + timeUpdateInterval + missedTimeUpdates;
            if (currentTimeSeconds >= 86400) {
                currentTimeSeconds = 0;
            }
            // serialDebugMsg("calculateCurrentTime: currentTimeSeconds = " + currentTimeSeconds);
            isUpdatingTime = false;
            missedTimeUpdates = 0;
        } else {
            missedTimeUpdates++;
            serialDebugMsg("calculateCurrentTime: Time is being updated, trying again later. Missed updates: " + missedTimeUpdates);
            return;
        }
        timeUpdateIntervalCounter++;
    }

    // TODO make time class out if time stuff, ore else start organizing this mess
    function sleepUntil(targetTime: number): void {
        const currentTime = control.millis();
        const delay = targetTime - currentTime;

        if (delay <= 0) {
            /* If the target time is in the past or now, call the callback immediately. */
        } else {
            basic.pause(delay);
        }
    }
    
    /**
    * Get the current time in seconds, 0 if currently unavailable.
    */
    //% blockId="ZHAW_Clock_TimeGet"
    //% block="current time"
    //% subcategory="Clock" group="Time"
    export function getCurrentTime(): number {
        let currentTimeSecondsLocal = 0;
        if (!isUpdatingTime) { // Mutex to prevent reading time while it is being calculated
            isUpdatingTime = true;
            currentTimeSecondsLocal = currentTimeSeconds;
            isUpdatingTime = false;
        } else {
            serialDebugMsg("getCurrentTime: Time is being updated, please try again later.");
            return 0
        }
        return currentTimeSecondsLocal;
    }

    /**
    * Get the current time as a formatted string in "hh:mm:ss".
    */
    //% blockId="ZHAW_Clock_TimeGetStr"
    //% block="current time as text"
    //% subcategory="Clock" group="Time"
    export function getCurrentTimeAsText(): string {
        let currentTimeSecondsLocal = 0;
        if (!isUpdatingTime) { // Mutex to prevent reading time while it is being calculated
            isUpdatingTime = true;
            currentTimeSecondsLocal = currentTimeSeconds;
            isUpdatingTime = false;
        } else {
            serialDebugMsg("getCurrentTimeAsText: Time is being updated, please try again later.");
        }
        let hours = Math.floor(currentTimeSecondsLocal / 3600) % 24;
        let minutes = Math.floor((currentTimeSecondsLocal % 3600) / 60);
        let seconds = currentTimeSecondsLocal % 60;

        return `${hours}:${minutes}:${seconds}`;
    }

    /** 
     * Set internal time to new value
     * @param hours is number from 0 to 23
     * @param minutes is number from 0 to 59
     * @param seconds is number from 0 to 59
    */
    //% blockId="ZHAW_Clock_TimeSet"
    //% block="set current time to $hours:$minutes:$seconds"
    //% hours.min=0 hours.max=23
    //% minutes.min = 0 minutes.max = 59
    //% seconds.min = 0 seconds.max = 59
    //% subcategory="Clock" group="Time"
    export function setCurrentTime(hours: number, minutes: number, seconds: number): void {
        // TODO Bug in block no switch for setting time, only works with variables
        // Validate the input time
        if (hours < 0 || hours > 23) {
            serialDebugMsg("Invalid hours. Must be between 0 and 23.");
        } else if (minutes < 0 || minutes > 59) {
            serialDebugMsg("Invalid minutes. Must be between 0 and 59.");
        } else if (seconds < 0 || seconds > 59) {
            serialDebugMsg("Invalid seconds. Must be between 0 and 59.");
        } else {
            if (!isUpdatingTime) { // Mutex to prevent updating time while it is being calculated
                // Calculate the curet time in seconds.
                // serialDebugMsg(`setCurrentTime: Current time is ${currentTimeSeconds}`);
                isUpdatingTime = true;
                currentTimeSeconds = hours * 3600 + minutes * 60 + seconds;
                isUpdatingTime = false;
                serialDebugMsg(`setCurrentTime: Time set to ${hours}:${minutes}:${seconds}`);

            } else {
                serialDebugMsg("setCurrentTime: Time is being updated, please try again later.");
                return;
            }
        }
        if (!wordClock) { // TODO in all exported functions check if class access is save! Do it like this
            serialDebugMsg("setCurrentTime: Error - WordClock object is not initialized, cannot update displayed time");
            return
        } else {
            wordClock.displayTime()
        }
    }


    /**
     * Set internal time to new value
     * @param timestring is in format "hh:mm:ss"
    */
    //% blockId="ZHAW_Clock_TimeSetStr"
    //% block="set current time to $timestring"
    //% subcategory="Clock" group="Time"
    export function setCurrentTimeStr(timestring: string): void {
        try {
            let data = timestring.split(":", 3)
            serialDebugMsg("setCurrentTimeStr: " + data[0] + data[1] + data[2])
            let hours = parseInt(data[0]) || 0
            let minutes = parseInt(data[1]) || 0
            let seconds = parseInt(data[2]) || 0
            setCurrentTime(hours, minutes, seconds)
        } catch {
            serialDebugMsg("setCurrentTimeStr: wrong format")
        }
    }

    /**
     * Clear icon
     * @param icon is number of icon [0..3]. Others will clear all
    */
    //% blockId="ZHAW_Clock_IconClear"
    //% block="clear icon || %icon"
    //% icon.defl=-1
    //% subcategory="Clock" group="Icon"
    export function clearIcon(icon?: number) {
        if (!wordClock) {
            serialDebugMsg("createWordClock: Error - WordClock object is not initialized");
            return
        }
        if(icon >= 0 && icon <4){
            icons[icon] = 0
        } else {
            for(let i=0; i<4; i++){
                icons[i] = 0
            }
        }
        wordClock.displayTime()
    }


    /**
     * Set an icon to a specified color
     * @param icon is number of icon [0..3]
    */
    //% blockId="ZHAW_Clock_IconSet"
    //% block="set icon %icon to color %color"
    //% color.shadow="colorNumberPicker"
    //% subcategory="Clock" group="Icon"
    export function setIconColor(icon: number, color: number) {
        if (!wordClock) {
            serialDebugMsg("createWordClock: Error - WordClock object is not initialized");
            return
        }
        if (icon >= 0 && icon < 4){
            icons[icon] = color
        } else {
            for(let i=0; i<4; i++){
                icons[i] = color
            }
        }
        
        wordClock.displayTime()
    }

    /**
     * Set colours of the words to new values
     */
    //% blockId="ZHAW_Clock_ColorsSet"
    //% block="set word colors hour color $hourColor minute color $minuteColor word color $wordColor || rainbow color $enableRainbowColors"
    //% hourColor.shadow="colorNumberPicker" hourColor.defl=0x007fff
    //% minuteColor.shadow="colorNumberPicker" minuteColor.defl=0x00ffff
    //% wordColor.shadow="colorNumberPicker" wordColor.defl=0x00ff00
    //% enableRainbowColors.shadow="toggleOnOff" enableRainbowColors.defl=false
    //% subcategory="Clock" group="Design"
    export function setWordColors(hourColor: number, minuteColor: number, wordColor: number,  enableRainbowColors?: boolean){
        if (!wordClock) {
            serialDebugMsg("createWordClock: Error - WordClock object is not initialized");
            return
        }
        wordClock.hourColor = hourColor
        wordClock.minuteColor = minuteColor
        wordClock.wordColor = wordColor
        wordClock.enableRainbowColors = enableRainbowColors
        wordClock.displayTime()
    }


    /**
     * Enable time setting with joystick. Up/Down for hours and Left/Right for minutes
     * @param state if true enables the joystick
    */
    //% blockId="ZHAW_Clock_JoystickTimeSet"
    //% block="set joystick time setting to %state"
    //% state.shadow="toggleOnOff"
    //% subcategory="Clock" group="Behaviour"
    export function setJoystickTimeEnable(state: boolean) {
        joystickTimeSetEnable = state
    }

    class WordClock {
        private _matrix: any;
        public hourColor: number;
        public minuteColor: number;
        public wordColor: number;
        public brightness: number;
        public enableRainbowColors: boolean = false;
        public rainbowSpeedColor: number;

        constructor(version: number = 1, hourColor: number, minuteColor: number, wordColor: number, enableRainbowColors: boolean) {
            basic.pause(10);
            this.hourColor = hourColor;
            this.minuteColor = minuteColor;
            this.wordColor = wordColor;
            this.brightness = currentBrightness;
            this.enableRainbowColors = enableRainbowColors;
            this.rainbowSpeedColor = rainbowSpeedColor;
            this._matrix = strip;

            if (!this._matrix) {
                serialDebugMsg("WordClock: Error - Matrix (Strip) not initialized");
                return;
            }

            /* DEBUG */
            // serialDebugMsg("WordClock: wordClockMappings = " + JSON.stringify(wordClockMappings));

            this.displayTime();
            serialDebugMsg("WordClock: Word clock initialized");
        }

        private getHourMapping(hour: number): number[][] {
            switch (hour) {
                case 0: return wordClockMappings.TWELVE;
                case 1: return wordClockMappings.ONE;
                case 2: return wordClockMappings.TWO;
                case 3: return wordClockMappings.THREE;
                case 4: return wordClockMappings.FOUR;
                case 5: return wordClockMappings.HOUR_FIVE;
                case 6: return wordClockMappings.SIX;
                case 7: return wordClockMappings.SEVEN;
                case 8: return wordClockMappings.EIGHT;
                case 9: return wordClockMappings.NINE;
                case 10: return wordClockMappings.HOUR_TEN;
                case 11: return wordClockMappings.ELEVEN;
                default:
                    serialDebugMsg("WordClock getHourMapping: Error - Invalid hour");
                    return [];
            }
        }

        private getMinuteMapping(minute: number): number[][] {
            switch (minute) {
                case 0: return [];
                case 5: return wordClockMappings.MIN_FIVE;
                case 10: return wordClockMappings.MIN_TEN;
                case 15: return wordClockMappings.QUARTER;
                case 20: return wordClockMappings.TWENTY;
                case 25: return wordClockMappings.TWENTY.concat(wordClockMappings.MIN_FIVE); // Instead of TWENTY_FIVE we use TWENTY and MIN_FIVE to fix memory issues
                case 30: return wordClockMappings.HALF;
                default:
                    serialDebugMsg("WordClock getMinuteMapping: Error - Invalid minute");
                    return [];
            }
        }

        private setClockPixels(pixels: number[][], color: number): void {
            for (let i = 0; i < pixels.length; i++) {
                const x = pixels[i][0];
                const y = pixels[i][1];
                setPixel(x, y, color);
                //serialDebugMsg("WordClock: setClockPixels: Set pixel(" + x + "," + y + ") to color: " + color);
            }
        }

        private clearClockArea(): void{
            if (!this._matrix) {
                serialDebugMsg("WordClock: Error - Matrix object is not initialized");
                return;
            }
            let icons: number[];
            for (let y = 0; y < 4; y++) {
                icons[y] = this._matrix.getColorFromPixel(0, y)
            }
            this._matrix.clear()
            for (let y=0; y<4; y++){
                this._matrix.setOnePixel(0, y, icons[y])
            }
        }

        private updateRainbowColors(): void {
            if (!this.enableRainbowColors) {
                return;
            }
             
            /* Extract RGB components from each color */
            let hourRgb = extractRgb(this.hourColor);
            let minuteRgb = extractRgb(this.minuteColor);
            let wordRgb = extractRgb(this.wordColor);

            /* Convert RGB to HSV */
            let hourHsv = rgbToHsv(hourRgb.r, hourRgb.g, hourRgb.b);
            let minuteHsv = rgbToHsv(minuteRgb.r, minuteRgb.g, minuteRgb.b);
            let wordHsv = rgbToHsv(wordRgb.r, wordRgb.g, wordRgb.b);

            /* Update each hue for the rainbow effect */
            hourHsv.h = (hourHsv.h + this.rainbowSpeedColor) % 360;
            minuteHsv.h = (minuteHsv.h + this.rainbowSpeedColor + 0.1 * this.rainbowSpeedColor) % 360;
            wordHsv.h = (wordHsv.h + this.rainbowSpeedColor + 0.2 * this.rainbowSpeedColor) % 360;

            /* Convert back to RGB */
            hourRgb = hsvToRgb(hourHsv.h, hourHsv.s, hourHsv.v);
            minuteRgb = hsvToRgb(minuteHsv.h, minuteHsv.s, minuteHsv.v);
            wordRgb = hsvToRgb(wordHsv.h, wordHsv.s, wordHsv.v);

            /* Combine RGB in color format, neopixel.rgb equivalent to (r << 16) | (g << 8) | b */
            this.hourColor = neopixel.rgb(hourRgb.r, hourRgb.g, hourRgb.b);
            this.minuteColor = neopixel.rgb(minuteRgb.r, minuteRgb.g, minuteRgb.b);
            this.wordColor = neopixel.rgb(wordRgb.r, wordRgb.g, wordRgb.b);
        }

        public displayTime(): void {
            if (!this._matrix) {
                serialDebugMsg("WordClock: Error - Matrix object is not initialized");
                return;
            }
            this._matrix.clear();
            //this.clearClockArea();
            const currentTimeSecondsLocal = getCurrentTime();
            let hours = Math.floor((currentTimeSecondsLocal / 3600) % 12);  // ensure hours are between 0 and 11 and are whole numbers
            let minutes = Math.floor((currentTimeSecondsLocal / 60) % 60); // ensure minutes are between 0 and 59 and are whole numbers
            serialDebugMsg("WordClock: hours = " + hours + ", minutes = " + minutes);

            /* Update the rainbow colors */
            this.updateRainbowColors();

            /* Adjust hours and minutes if minutes are more than 60 or less than 0 */
            if (minutes >= 60) {
                minutes -= 60;
                hours = Math.floor((hours + 1) % 12);
            } else if (minutes < 0) {
                minutes += 60;
                hours = Math.floor((hours + 11) % 12);
            }

            // /* for testing the word clock jumping the time, set wordclock update interval to 1 second */
            // if (minutes + 2 >= 60) {
            //     setCurrentTime((hours + 0.02) % 24, minutes % 60, 0);
            // } else {
            //     setCurrentTime(hours % 24, (minutes + 2) % 60, 0);
            // }

            /* Calculate the modifier (past/to) and adjust the hours and minutes accordingly. */
            let modifierMapping: number[][];
            if (minutes > 32) {
                hours = Math.floor((hours + 1) % 12);
                minutes = 60 - minutes;
                modifierMapping = wordClockMappings.TO;
            } else {
                modifierMapping = wordClockMappings.PAST;
            }
            minutes = 5 * Math.round(minutes / 5); // we only display minutes with a resolution of 5 minute
            // serialDebugMsg("WordClock: after conversion, hours = " + hours + ", minutes = " + minutes);

            let hoursMapping = this.getHourMapping(hours);
            if (!Array.isArray(hoursMapping) || !hoursMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                serialDebugMsg("WordClock: Error - mapping hours returned not a valid array of tuples");
                serialDebugMsg("WordClock: Mapped hours = " + JSON.stringify(hoursMapping));
            } else {
                /* Set pixels for hours */
                this.setClockPixels(hoursMapping, this.hourColor);
            }

            hoursMapping = null; // free memory

            if (minutes !== 0) {
                /* Set pixels for minutes */
                let minutesMapping = this.getMinuteMapping(minutes);
                if (Array.isArray(minutesMapping) && minutesMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                    this.setClockPixels(minutesMapping as number[][], this.minuteColor);
                } else {
                    serialDebugMsg("WordClock: Error - mapping minutes returned not a valid array of tuples");
                    serialDebugMsg("WordClock: Mapped minutes = " + JSON.stringify(minutesMapping));
                }
                minutesMapping = null; // free memory

                /* Set pixels for modifier */
                if (Array.isArray(modifierMapping) && modifierMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                    this.setClockPixels(modifierMapping, this.wordColor);
                } else {
                    serialDebugMsg("WordClock: Error - mapping modifier returned not a valid array of tuples");
                    serialDebugMsg("WordClock: Mapped modifier = " + JSON.stringify(modifierMapping));
                }
                modifierMapping = null; // free memory
            }

            /* Set icon pixels */
            for (let y = 0; y < 4; y++) {
                this.setClockPixels([[0,y]], icons[y])
            }

            this._matrix.setBrightness(this.brightness);
            this._matrix.show();
        }

        public setTime(): void {
            const joystickDirection: eJoystickDirection = readJoystick();
            /* If the joystick is not pressed, do nothing */
            if (joystickDirection == eJoystickDirection.NotPressed) {
                return;
            }
            const currentTimeSecondsLocal = getCurrentTime();
            const hours = Math.floor((currentTimeSecondsLocal / 3600) % 12);  // ensure hours are between 0 and 11 and are whole numbers
            const minutes = Math.floor((currentTimeSecondsLocal / 60) % 60);  // ensure minutes are between 0 and 59 and are whole numbers
            switch (joystickDirection) {
                case eJoystickDirection.Up:
                    /* Increase hours by 1 */
                    setCurrentTime((hours + 1) % 12, minutes, 0);
                    break;
                case eJoystickDirection.Down:
                    /* Decrease hours by 1 */
                    setCurrentTime((hours + 11) % 12, minutes, 0);
                    break;
                case eJoystickDirection.Right:
                    /* Increase minutes by 5 */
                    setCurrentTime(hours, (minutes + 5) % 60, 0);
                    break;
                case eJoystickDirection.Left:
                    /* Decrease minutes by 5 */
                    setCurrentTime(hours, (minutes + 55) % 60, 0);
                    break;
                default:
                    break;
            }

            /* Display the new time */
            this.displayTime();
        }
    }


    /**
     * Initialize Word Clock with given colours. Time will be tracked and pixels on the matrix updated in background.
     * Note: Initialize Luma Matrix before this block.
     * Warning: Do not use other methods from Pixel group while using this as those blocks will work against the clock logic.
     * Optional: joystick enable allows to "scroll" through internal time if turned on. This can be changed during runtime.
     */
    //% blockId="ZHAW_Clock_CreateWordClock"
    //% block="create word clock | hour color $hourColor minute color $minuteColor word color $wordColor || rainbow colors $enableRainbowColors clock dial $version set time with joystick %joystickEnable"
    //% version.defl=lumaMatrix.eMatrixVersion.V2
    //% hourColor.shadow="colorNumberPicker" hourColor.defl=0x007fff
    //% minuteColor.shadow="colorNumberPicker" minuteColor.defl=0x00ffff
    //% wordColor.shadow="colorNumberPicker" wordColor.defl=0x00ff00
    //% enableRainbowColors.shadow="toggleOnOff" enableRainbowColors.defl=false
    //% joystickEnable.shadow="toggleOnOff" joystickEnable.defl=true
    //% subcategory="Clock" group="Time"
    // Not if this block is used with the control.inBackground block, it will not work #BUG 
    export function createWordClock(hourColor: number, minuteColor: number, wordColor: number, enableRainbowColors?: boolean, version?: eMatrixVersion, joystickEnable?: boolean): void {
        wordClock = new WordClock(version, hourColor, minuteColor, wordColor, enableRainbowColors);
        basic.pause(1);
        if (!wordClock) {
            serialDebugMsg("createWordClock: Critical Error - Failed to create WordClock object");
            basic.pause(1000 * 1000000); // This should never happen if so we do not continue and wait for a long time (1000000 seconds)
            return;
        } else {
            serialDebugMsg("createWordClock: WordClock object initialized successfully");
        }
        joystickTimeSetEnable = joystickEnable

        /* Mutex to prevent multiple threads from running at the same time */
        let lock = false;

        control.inBackground(() => {
            while (true) {
                if (!lock) {
                    lock = true;
                    try {
                        wordClock.displayTime();
                    } catch (e) {
                        serialDebugMsg("createWordClock: Error in word clock");
                    } finally {
                        lock = false;
                    }
                    /* Wait to refresh the display */
                    basic.pause(wordClockDisplayUpdateInterval * 1000);
                }
                basic.pause(10); // Small delay to prevent tight loop
            }
        });

        control.inBackground(() => {
            while (true) {
                if (joystickTimeSetEnable == false){
                    // Nothing to do
                } else if (!lock) {
                    lock = true;
                    try {
                        wordClock.setTime();
                    } catch (e) {
                        serialDebugMsg("createWordClock: Error in setTime");
                    } finally {
                        lock = false;
                    }
                    /* Poll the joystick every 100ms */
                    basic.pause(1000);
                }
                basic.pause(10); // Small delay to prevent tight loop
            }
        });
    }
}