---
title: Block Description
---


This document describes the blocks available in the NeoPixelMatrix extension.

## Pixels

Pixels blocks are used to control the LEDs on the matrix. 

### Initilization

Initialize the matrix with the pin and brightness. The brightness can be set from 0 to 255. The default brightness is 127. This function needs to be called before any other function which interacts with the matrix.

```blocks	
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 127)
```



### Set Brightness

Set the brightness of the LEDs. The brightness can be set from 0 to 255. The default brightness is 127.

```blocks	
NeoPixelMatrix.setBrightness(255)
```

### Show Image

Draw an image in a specific color on the matrix. The image is a string of 64 characters, each representing a pixel on the matrix. The color is a hex value. 
The selcted pixels will be added to the matrix and displayed along with the existing pixels. 

```blocks	
NeoPixelMatrix.showImage(NeoPixelMatrix.matrix8x8(`
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

---
## Inputs
On the back of th matrix there are two inputs, a joystick and a switch.


### Read GPIO

Read the value from a specified GPIO pin.

```blocks
let gpioValue = NeoPixelMatrix.readGPIO(DigitalPin.P1)
```

### Read Switch

Read the current value of the switch.

```blocks
let switchValue = NeoPixelMatrix.readSwitch()
```

### Check if Switch is Set

Check if the switch is set.

```blocks
let isSwitchSet = NeoPixelMatrix.isSwitchSet()
```

### Read Joystick Direction

Read the current direction of the joystick.

```blocks
let joystickDirection = NeoPixelMatrix.readJoystick()
```

### Read Joystick Direction as Text

Read the current direction of the joystick as text.

```blocks
let joystickDirectionText = NeoPixelMatrix.readJoystickText()
```

### Compare Joystick Direction

Compare the current joystick direction with a specified direction.

```blocks
let isJoystickDown = NeoPixelMatrix.compareJoystick(joystickDirection, eJoystickDirection.Down)
```

### Joystick Direction Changed Callback

Execute a callback function when the joystick direction changes.

```blocks
NeoPixelMatrix.joystickChangedThread(() => {
  console.log("Joystick direction changed")
})
```

### Joystick Direction Specific Callback

Execute a callback function when the joystick moves in a specified direction.

```blocks
NeoPixelMatrix.joystickDirectionThread(eJoystickDirection.Up, () => {
  console.log("Joystick moved up")
})
```


```blocks	
if (NeoPixelMatrix.compareJoystick(NeoPixelMatrix.readJoystick(), eJoystickDirection.Down)) {
    NeoPixelMatrix.setOnePixel(7, 0, 0xffff00)
}
```


---
## Clock

### Create Word Clock

Create a clock thread to track time and light up specific LEDs to display the time.

```blocks	
NeoPixelMatrix.createWordClock(
eMatrixVersion.V2,
0x007fff,
0xffff00,
0x00ff00
)
```



<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>