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


LumaMatrix.debugEnable(true)
LumaMatrix.initializeMatrix(135)
LumaMatrix.scrollText("LUMA MATRIX", 0xff00FF, 90)
LumaMatrix.showImage(LumaMatrix.matrix8x8(`
    . . . . . . . .
    . # # . . # # .
    . # # . . # # .
    . . . . . . . .
    # . . . . . . #
    . # . . . . # .
    . . # # # # . .
    . . . . . . . .
    `), 0xffff00)
basic.pause(2000)
LumaMatrix.createWordClock(eMatrixVersion.V1, 0xff00ff, 0x00ffff, 0xffff00)
LumaMatrix.setCurrentTime(15, 33, 0)

while (true) {
    basic.pause(5000)
    serial.writeLine(LumaMatrix.getCurrentTimeAsText())
}