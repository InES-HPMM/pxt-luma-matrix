# Example Project

```blocks
lumaMatrix.initializeMatrix(127)
basic.pause(100)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
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
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . . . .
    . . . . . # . .
    . . . . . . . .
    . . . . # . . .
    . # . . . . . .
    `), 0x00ff00)
lumaMatrix.setBrightness(255)
if (lumaMatrix.compareJoystick(lumaMatrix.readJoystick(), lumaMatrix.eJoystickDirection.Down)) {
    lumaMatrix.setOnePixel(7, 0, 0xffff00)
}
basic.pause(1000)
lumaMatrix.createWordClock(
lumaMatrix.eMatrixVersion.V2,
0x007fff,
0xffff00,
0x00ff00
)
lumaMatrix.setBrightness(127)
```

```blocks
lumaMatrix.switchValueChangedThread(function () {
    if (lumaMatrix.isSwitchSet()) {
        lumaMatrix.setOnePixel(7, 1, 0xffff00)
    } else {
        lumaMatrix.setOnePixel(7, 1, 0xff0000)
    }
})
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>
