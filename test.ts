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
 * -- Date:	    16.12.2024
 * -- Author:   hesu
 * --
 * ------------------------------------------------------------------
 */

Lumatrix.switchValueChangedThread(function () {
    basic.showNumber(Lumatrix.readSwitch())
    serial.writeValue("switch", Lumatrix.readSwitch())
    Lumatrix.setCurrentTime(h, m, s)
})
let s = 0
let m = 0
let h = 0
Lumatrix.debugEnable(true)
Lumatrix.initializeMatrix(DigitalPin.P0, 135)
Lumatrix.createWordClock(
eMatrixVersion.V1,
0x00ff00,
0x007fff,
0xff0000
)
h = 0
m = 22
s = 55
while (true) {
    basic.pause(5000)
    serial.writeLine(Lumatrix.getCurrentTimeAsText())
}