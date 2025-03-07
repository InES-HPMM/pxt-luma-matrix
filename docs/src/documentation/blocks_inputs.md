# Inputs
On the back of th matrix there are two inputs, a joystick and a switch.


### Read GPIO

Read the value from a specified GPIO pin.

```blocks
let gpioValue = lumaMatrix.readGPIO(DigitalPin.P1)
```

### Read Switch

Read the current value of the switch.

```blocks
let switchValue = lumaMatrix.readSwitch()
```

### Check if Switch is Set

Check if the switch is set.

```blocks
let isSwitchSet = lumaMatrix.isSwitchSet(true)
```

### Read Joystick Direction

Read the current direction of the joystick.

```blocks
let joystickDirection = lumaMatrix.readJoystick()
```

### Read Joystick Direction as Text

Read the current direction of the joystick as text.

```blocks
let joystickDirectionText = lumaMatrix.readJoystickText()
```

### Compare Joystick Direction

Compare the current joystick direction with a specified direction.

```blocks
let isJoystickDown = lumaMatrix.compareJoystick(joystickDirection, lumaMatrix.eJoystickDirection.Down)
```

### Joystick Direction Changed Callback

Execute a callback function when the joystick direction changes.

```blocks
lumaMatrix.joystickChangedThread(() => {
  console.log("Joystick direction changed")
})
```

### Joystick Direction Specific Callback

Execute a callback function when the joystick moves in a specified direction.

```blocks
lumaMatrix.joystickDirectionThread(lumaMatrix.eJoystickDirection.Up, () => {
  console.log("Joystick moved up")
})
```


```blocks	
if (lumaMatrix.compareJoystick(lumaMatrix.readJoystick(), lumaMatrix.eJoystickDirection.Down)) {
    lumaMatrix.setOnePixel(7, 0, 0xffff00)
}
```





<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>