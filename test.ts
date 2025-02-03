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
lumaMatrix.scrollText("LUMA MATRIX", 0xff00ff, 90)
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
basic.pause(2000)
lumaMatrix.createWordClock(lumaMatrix.eMatrixVersion.V1, 0xff00ff, 0x00ffff, 0xffff00)
lumaMatrix.setCurrentTime(15, 33, 0)

while (true) {
    basic.pause(5000)
    serial.writeLine(lumaMatrix.getCurrentTimeAsText())
}

