# Challenge 2 - Lamp

Your Luma Matrix should function as a lamp. Use the slide switch on the back as a light switch. Switched on means that all LEDs in the matrix should light up. Switched off means all LEDs are dark. Use the "Set pixel" block from task 1 again. Which loop is best suited to solve this task?

```admonish tip
These blocks may be helpful
```

```blocks
lumaMatrix.switchValueChangedThread(function (state) {
	
})

if (lumaMatrix.isSwitchSet(true)) {
	
} else {
	
}
```






<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>