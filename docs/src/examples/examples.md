# Example Project

```blocks
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 127)
basic.pause(100)
NeoPixelMatrix.showImage(NeoPixelMatrix.matrix8x8(`
    # . . . . . . .
    # . . . . . . .
    # . . . . . . .
    # . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    `), 0x007fff)
basic.pause(1000)
NeoPixelMatrix.showImage(NeoPixelMatrix.matrix8x8(`
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . # . .
    . . . . . . . .
    . . . . # . . .
    . # . . . . . .
    `), 0x00ff00)
NeoPixelMatrix.setBrightness(255)
if (NeoPixelMatrix.compareJoystick(NeoPixelMatrix.readJoystick(), eJoystickDirection.Down)) {
    NeoPixelMatrix.setOnePixel(7, 0, 0xffff00)
}
basic.pause(1000)
NeoPixelMatrix.createWordClock(
eMatrixVersion.V2,
0x007fff,
0xffff00,
0x00ff00
)
NeoPixelMatrix.setBrightness(127)
```

```blocks
NeoPixelMatrix.switchValueChangedThread(function () {
    if (NeoPixelMatrix.isSwitchSet()) {
        NeoPixelMatrix.setOnePixel(7, 1, 0xffff00)
    } else {
        NeoPixelMatrix.setOnePixel(7, 1, 0xff0000)
    }
})
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>
