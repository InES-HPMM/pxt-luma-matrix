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

### Countdown

A countdown timer can be visualized in multiple ways. This example shows the remaining seconds as scrolling numbers.

```blocks
input.onButtonPressed(Button.A, function () {
    counter = 60
})
let counter = 0
lumaMatrix.initializeMatrix(127)
counter = -1
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . # # # # . .
    . # . . . . # .
    # . . . . . . #
    # . . . . . . #
    # . . . . . . #
    # . . . . . . #
    . # . . . . # .
    . . # # # # . .
    `), 0xffffff)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . . . # . . . .
    . . . # . . . .
    . . . # . . . .
    . . . # # . . .
    . . . . . # . .
    . . . . . . . .
    . . . . . . . .
    `), 0xff8000)
loops.everyInterval(1000, function () {
    if (counter > 0) {
        lumaMatrix.scrollText(convertToText(counter), 0x00ff00, 90)
        counter += -1
    } else if (counter == 0) {
        lumaMatrix.scrollText("Time is up", 0xff0000, 90)
        counter = -1
    } else {
        lumaMatrix.showImage(lumaMatrix.matrix8x8(`
            . . # # # # . .
            . # . . . . # .
            # . . . . . . #
            # . . . . . . #
            # . . . . . . #
            # . . . . . . #
            . # . . . . # .
            . . # # # # . .
            `), 0xffffff)
        lumaMatrix.showImage(lumaMatrix.matrix8x8(`
            . . . . . . . .
            . . . # . . . .
            . . . # . . . .
            . . . # . . . .
            . . . # # . . .
            . . . . . # . .
            . . . . . . . .
            . . . . . . . .
            `), 0xff8000)
    }
})

```

A different approch would be to visualize the countdown as a kind of progress bar using all pixels.

```blocks
input.onButtonPressed(Button.A, function () {
    counter = counter_time
})
let index = 0
let progress = 0
let counter_time = 0
let counter = 0
lumaMatrix.initializeMatrix(127)
counter = -1
counter_time = 60
let num_leds = 64
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . # # # # . .
    . # . . . . # .
    # . . . . . . #
    # . . . . . . #
    # . . . . . . #
    # . . . . . . #
    . # . . . . # .
    . . # # # # . .
    `), 0xffffff)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . . . # . . . .
    . . . # . . . .
    . . . # . . . .
    . . . # # . . .
    . . . . . # . .
    . . . . . . . .
    . . . . . . . .
    `), 0xff8000)
loops.everyInterval(1000, function () {
    if (counter > 0) {
        progress = Math.map(counter, 0, counter_time, 0, num_leds)
        for (let y = 0; y <= 7; y++) {
            for (let x = 0; x <= 7; x++) {
                index = y * 8 + x
                if (index < progress) {
                    lumaMatrix.setOnePixel(x, y, 0xffff00)
                } else {
                    lumaMatrix.setOnePixel(x, y, 0x000000)
                }
            }
        }
        counter += -1
    } else if (counter == 0) {
        lumaMatrix.scrollText("Time is up", 0xff0000, 90)
        counter = -1
    } else {
        lumaMatrix.showImage(lumaMatrix.matrix8x8(`
            . . # # # # . .
            . # . . . . # .
            # . . . . . . #
            # . . . . . . #
            # . . . . . . #
            # . . . . . . #
            . # . . . . # .
            . . # # # # . .
            `), 0xffffff)
        lumaMatrix.showImage(lumaMatrix.matrix8x8(`
            . . . . . . . .
            . . . # . . . .
            . . . # . . . .
            . . . # . . . .
            . . . # # . . .
            . . . . . # . .
            . . . . . . . .
            . . . . . . . .
            `), 0xff8000)
    }
})
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>
