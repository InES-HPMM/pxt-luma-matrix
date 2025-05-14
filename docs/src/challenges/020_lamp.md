# Challenge 2 - Lamp

Deine Lumatrix sollte wie eine Lampe funktionieren. Verwende den Schiebeschalter auf der Rückseite als Lichtschalter. Eingeschaltet bedeutet, dass alle LEDs in der Matrix aufleuchten sollten. Ausgeschaltet bedeutet, dass alle LEDs dunkel sind. Verwende den Block „Pixel setzen“ aus der Luma Matrix Erweiterung. Welche Schleife ist am besten geeignet, um diese Aufgabe zu lösen?

```admonish tip
Diese Blöcke können hilfreich sein
```

```blocks
lumaMatrix.switchValueChangedThread(function (state) {
	
})

if (lumaMatrix.isSwitchSet(true)) {
	
} else {
	
}
```






<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>