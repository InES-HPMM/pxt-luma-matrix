
# Challenge 2

In dieser Challenge wirst du einen Lauftext auf deiner Matrix anzeigen.

## Initialisiere die Matrix

```blocks
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 127)
Welchen_Block_musst_du_hier_einsetzen?
```

## Lösung
```blocks
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 127)
NeoPixelMatrix.scrollText("HELLO WORLD", 0x00ffff, 80)
```


<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>