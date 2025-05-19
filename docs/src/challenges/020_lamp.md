# Challenge 2 - Lampe

Deine Lumatrix sollte wie eine Lampe funktionieren. Verwende den Schiebeschalter auf der Rückseite als Lichtschalter. Eingeschaltet bedeutet, dass alle LEDs in der Matrix aufleuchten sollten. Ausgeschaltet bedeutet, dass alle LEDs dunkel sind. Verwende den Block „Pixel setzen“ aus der Luma Matrix Erweiterung. Welche Schleife ist am besten geeignet, um diese Aufgabe zu lösen?

<!-- ```admonish tip
Diese Blöcke können hilfreich sein
``` -->

### Diese Blöcke können hilfreich sein

```blocks
lumaMatrix.switchValueChangedThread(function (state) {
	
})

if (lumaMatrix.isSwitchSet(true)) {
	
} else {
	
}
```

```admonish tip title="Erweiterung 1" collapsible=true
Erstelle ein Blinklicht, so dass alle LEDs in der Matrix blinken wenn der Schalter eingeschaltet ist. 
```

```admonish tip title="Erweiterung 2" collapsible=true
Nutze den Joystick um den Blinkmodus ein- bzw. auszuschalten. 
```




<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>