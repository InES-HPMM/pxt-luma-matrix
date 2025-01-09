
# Challenge 1

In dieser Challenge wirst du deine Matrix aufleuchten lassen.

## Initialisiere die Matrix

```blocks
Lumatrix.initializeMatrix(DigitalPin.P0, 127)
Welchen_Block_musst_du_hier_einsetzen?
```

## Lösung
```blocks
Lumatrix.initializeMatrix(DigitalPin.P0, 127)
Lumatrix.showImage(Lumatrix.matrix8x8(`
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