
# Challenge 1

In dieser Challenge wirst du deine Matrix aufleuchten lassen.

## Initialisiere die Matrix

```blocks
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 127)
Welchen_Block_musst_du_hier_einsetzen?
```

## Lösung
```blocks
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 127)
NeoPixelMatrix.showImage(NeoPixelMatrix.matrix8x8(`
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