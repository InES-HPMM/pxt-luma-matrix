/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    test.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    08.01.2024
 * -- Author:   ebep
 * --
 * -- Description:  Illustrate and test core functionality
 * ------------------------------------------------------------------
 */

lumaMatrix.debugEnable(true)
lumaMatrix.initializeMatrix(135)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
   . . . . . . . .
   . # # . . # # .
   . # # . . # # .
   . . . . . . . .
   # . . . . . . #
   . # . . . . # .
   . . # # # # . .
   . . . . . . . .
   `), 0xffff00)
for (let i = 0; i < 8; i++) {
   lumaMatrix.setOnePixelRGB(0, i, 0, 255, 0)
   basic.pause(100)
}
basic.pause(500)
lumaMatrix.setCurrentTime(15, 33, 0)
if(0 == lumaMatrix.readSwitch()){
    lumaMatrix.createWordClock(0xff00ff, 0x00ffff, 0xffff00, true, 2)
} else {
    // lumaMatrix.tetrisMini()
    lumaMatrix.snake()
}

while (true) {
    basic.pause(5000)
    serial.writeLine(lumaMatrix.getCurrentTimeAsText())
}

