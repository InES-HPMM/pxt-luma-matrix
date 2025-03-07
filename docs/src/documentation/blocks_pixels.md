# Pixels

Pixels blocks are used to control the LEDs on the matrix. 

### Initilization

Initialize the matrix with the pin and brightness. The brightness can be set from 0 to 255. The default brightness is 127. This function needs to be called before any other function which interacts with the matrix.

```blocks	
lumaMatrix.initializeMatrix(127)
```

### Set Brightness

Set the brightness of the LEDs. The brightness can be set from 0 to 255. The default brightness is 127.

```blocks	
lumaMatrix.setBrightness(255)
```

### Show Image

Draw an image in a specific color on the matrix. The image is a string of 64 characters, each representing a pixel on the matrix. The color is a hex value. 
The selcted pixels will be added to the matrix and displayed along with the existing pixels. 

```blocks	
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . . . . . . . .
    . . # . . # . .
    . . . . . . . .
    . . . . . . . .
    . # . . . . # .
    . # # # # # # .
    . . . . . . . .
    `), 0x00ff00)
```

<!-- <script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>
 -->

<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>