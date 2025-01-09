# Example Project

```blocks
Lumatrix.initializeMatrix(DigitalPin.P0, 127)
basic.pause(100)
Lumatrix.showImage(Lumatrix.matrix8x8(`
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
Lumatrix.showImage(Lumatrix.matrix8x8(`
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . # . .
    . . . . . . . .
    . . . . # . . .
    . # . . . . . .
    `), 0x00ff00)
Lumatrix.setBrightness(255)
if (Lumatrix.compareJoystick(Lumatrix.readJoystick(), eJoystickDirection.Down)) {
    Lumatrix.setOnePixel(7, 0, 0xffff00)
}
basic.pause(1000)
Lumatrix.createWordClock(
eMatrixVersion.V2,
0x007fff,
0xffff00,
0x00ff00
)
Lumatrix.setBrightness(127)
```

```blocks
Lumatrix.switchValueChangedThread(function () {
    if (Lumatrix.isSwitchSet()) {
        Lumatrix.setOnePixel(7, 1, 0xffff00)
    } else {
        Lumatrix.setOnePixel(7, 1, 0xff0000)
    }
})
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>
