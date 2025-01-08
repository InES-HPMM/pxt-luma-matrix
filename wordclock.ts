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
 * -- Author:   vore, hesu, ebep
 * --
 * ------------------------------------------------------------------
 */
namespace NeoPixelMatrix {

    const startTime = control.millis();
    let currentTimeSeconds: number = 0;
    const timeUpdateInterval: number = 1; // in second
    let timeUpdateIntervalCounter = 0;
    let isUpdatingTime: boolean = false;
    let missedTimeUpdates: number = 0;
    let wordClockDisplayUpdateInterval = 60; // in seconds

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

        // serialDebugMsg("sleepUntil: Current time: " + currentTime + " ms Target time: " + targetTime + " ms Delay: " + delay + " ms");

        if (delay <= 0) {
            /* If the target time is in the past or now, call the callback immediately. */
        } else {
            basic.pause(delay);
        }
    }
    
    //% blockId="Clock_TimeGet"
    //% block="get current time"
    //% group="Clock"
    export function getCurrentTime(): number {
        let currentTimeSecondsLocal = 0;
        if (!isUpdatingTime) { // Mutex to prevent reading time while it is being calculated
            isUpdatingTime = true;
            currentTimeSecondsLocal = currentTimeSeconds;
            isUpdatingTime = false;
        } else {
            serialDebugMsg("getCurrentTime: Time is being updated, please try again later.");
        }
        return currentTimeSecondsLocal;
    }

    //% blockId="Clock_TimeGetStr"
    //% block="get current time as text"
    //% group="Clock"
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

        /* return the time as a 2D array of numbers. */
        // return [
        //     [hours],
        //     [minutes],
        //     [seconds]
        // ];
        return `${hours}:${minutes}:${seconds}`; // return the time as a string
    }

    /* TODO Bug in block no switch for setting time, only works with variables. */
    //% blockId="Clock_TimeSet"
    //% block="set current time to $hours:$minutes:$seconds"
    //% hours.min=0 hours.max=23
    //% minutes.min = 0 minutes.max = 59
    //% seconds.min = 0 seconds.max = 59
    //% group="Clock"
    export function setCurrentTime(hours: number, minutes: number, seconds: number): void {
        // Validate the input time
        if (hours < 0 || hours > 23) {
            serialDebugMsg("Invalid hours. Must be between 0 and 23.");
        } else if (minutes < 0 || minutes > 59) {
            serialDebugMsg("Invalid minutes. Must be between 0 and 59.");
        } else if (seconds < 0 || seconds > 59) {
            serialDebugMsg("Invalid seconds. Must be between 0 and 59.");
        } else {
            if (!isUpdatingTime) { // Mutex to prevent updating time while it is being calculated
                /* Calculate the curet time in seconds. */
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
    }

    class WordClock {
        private _matrix: any;
        public hourColor: number;
        public minuteColor: number;
        public wordColor: number;
        public brightness: number;

        constructor(version: number = 1, hourColor: number, minuteColor: number, wordColor: number) {
            basic.pause(10);
            this.hourColor = hourColor;
            this.minuteColor = minuteColor;
            this.wordColor = wordColor;
            this.brightness = currentBrightness;
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

        public displayTime(): void {
            this._matrix.clear();
            const currentTimeSecondsLocal = getCurrentTime();
            let hours = Math.floor((currentTimeSecondsLocal / 3600) % 12);  // ensure hours are between 0 and 11 and are whole numbers
            let minutes = Math.floor((currentTimeSecondsLocal / 60) % 60); // ensure minutes are between 0 and 59 and are whole numbers
            serialDebugMsg("WordClock: hours = " + hours + ", minutes = " + minutes);

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

            /* Set pixels for hours */
            this.setClockPixels(hoursMapping, this.hourColor);
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

    /* Not if this block is used with the control.inBackground block, it will not work #BUG */
    //% blockId="Clock_CreateWordClock"
    //% block="create word clock version $version hour color $hourColor minute color $minuteColor word color $wordColor"
    //% version.defl=eMatrixVersion.V1
    //% hourColor.shadow="colorNumberPicker"
    //% minuteColor.shadow="colorNumberPicker"
    //% wordColor.shadow="colorNumberPicker"
    //% group="Clock"
    export function createWordClock(version: eMatrixVersion, hourColor: number, minuteColor: number, wordColor: number): void {
        const wordClock = new WordClock(version, hourColor, minuteColor, wordColor);
        basic.pause(100);
        if (!wordClock) {
            serialDebugMsg("createWordClock: Error - WordClock object is not initialized");
        } else {
            serialDebugMsg("createWordClock: WordClock object initialized successfully");
        }

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
                if (!lock) {
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