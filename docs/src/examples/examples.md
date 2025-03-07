# Example Project

### Light up every pixel

This example lights up every pixel of the matrix in yellow, one by one.

```blocks
lumaMatrix.initializeMatrix(127)
basic.forever(function () {
    for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 7; x++) {
            lumaMatrix.setOnePixel(x, y, 0xffff00)
            basic.pause(100)
        }
    }
    basic.pause(1000)
    lumaMatrix.clear()
})
```


### Draw an Image

This example draws a heart on the matrix, color and position is depnding on the switch state.

```blocks
lumaMatrix.initializeMatrix(127)
basic.forever(function () {
    if (lumaMatrix.isSwitchSet(true)) {
        lumaMatrix.showImage(lumaMatrix.matrix8x8(`
            . . . . . . . .
            . # # . # # . .
            # # # # # # # .
            # # # # # # # .
            # # # # # # # .
            . # # # # # . .
            . . # # # . . .
            . . . # . . . .
            `), 0xff0000)
    } else {
        lumaMatrix.showImage(lumaMatrix.matrix8x8(`
            . . . . . . . .
            . . # # . # # .
            . # # # # # # #
            . # # # # # # #
            . # # # # # # #
            . . # # # # # .
            . . . # # # . .
            . . . . # . . .
            `), 0xff8000)
    }
})
```

<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>