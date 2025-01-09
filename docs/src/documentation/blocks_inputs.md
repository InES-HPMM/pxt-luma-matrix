# Inputs
On the back of th matrix there are two inputs, a joystick and a switch.


### Read GPIO

Read the value from a specified GPIO pin.

```blocks
let gpioValue = Lumatrix.readGPIO(DigitalPin.P1)
```

### Read Switch

Read the current value of the switch.

```blocks
let switchValue = Lumatrix.readSwitch()
```

### Check if Switch is Set

Check if the switch is set.

```blocks
let isSwitchSet = Lumatrix.isSwitchSet()
```

### Read Joystick Direction

Read the current direction of the joystick.

```blocks
let joystickDirection = Lumatrix.readJoystick()
```

### Read Joystick Direction as Text

Read the current direction of the joystick as text.

```blocks
let joystickDirectionText = Lumatrix.readJoystickText()
```

### Compare Joystick Direction

Compare the current joystick direction with a specified direction.

```blocks
let isJoystickDown = Lumatrix.compareJoystick(joystickDirection, eJoystickDirection.Down)
```

### Joystick Direction Changed Callback

Execute a callback function when the joystick direction changes.

```blocks
Lumatrix.joystickChangedThread(() => {
  console.log("Joystick direction changed")
})
```

### Joystick Direction Specific Callback

Execute a callback function when the joystick moves in a specified direction.

```blocks
Lumatrix.joystickDirectionThread(eJoystickDirection.Up, () => {
  console.log("Joystick moved up")
})
```


```blocks	
if (Lumatrix.compareJoystick(Lumatrix.readJoystick(), eJoystickDirection.Down)) {
    Lumatrix.setOnePixel(7, 0, 0xffff00)
}
```





<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/Microbit-LED-Matrix");</script>