
# Challenge 2

In this challenge you will learn how to scroll text across the LED matrix.

```blocks
lumaMatrix.initializeMatrix(127)
Which_block_is_needed_here?
```

## Solution

```blocks
lumaMatrix.initializeMatrix(127)
lumaMatrix.scrollText("HELLO WORLD", 0x00ffff, 80)
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>