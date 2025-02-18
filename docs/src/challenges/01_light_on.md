
# Challenge 1

In this challenge you will learn how to turn on all the LEDs of the LED matrix.

```blocks
lumaMatrix.initializeMatrix(127)
Which_block_is_needed_here?
```

## Solution

```blocks
lumaMatrix.initializeMatrix(127)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    # # # # # # # #
    # # # # # # # #
    # # # # # # # #
    # # # # # # # #
    # # # # # # # #
    # # # # # # # #
    # # # # # # # #
    # # # # # # # #
    `), 0xffff00)
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>