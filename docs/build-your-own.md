# Build your own Luma Matrix

The extension allows to render graphics for a 8x8 NeoPixel Matrix using MakeCode. The matrix can be used to display images, text, and control individual pixels. 

![lumatrix-schematic](./assets/lumatrix-schematic.png)

## Parts List

| Part | Description | Link |
|-------------|---------------|---------------|
| micro:bit v2 | Microcontroller to be programmed with MakeCode | [micro:bit](https://microbit.org/buy/) |
| 8x8 NeoPixel Matrix | 8x8 grid array of Neopixels. Can be single PCB with pixels or a chained set of strips. | [Adafruit](https://www.adafruit.com/product/1487) |
| 5V Power Supply | Power source of choice for the Matrix (USB power bank, DC barrel jack with adapter, etc.) | [Adafruit](https://www.adafruit.com/product/276) |
| DC Barrel Jack to Alligator Clips | Connect power supply to matrix | [Adafruit](https://www.adafruit.com/product/1328) |
| Wires for connection |  Alligator Clips or similar | [Adafruit](https://www.adafruit.com/product/1008) |
| Joystick (optional) | Input device for the micro:bit | [Adafruit](https://www.adafruit.com/product/480) |

## Connection
> **Note:** Do not connect the matrix VCC directly to the micro:bit 3V. The matrix requires more power than the micro:bit can provide.

1. Flash the micro:bit with the built code using MakeCode
2. Connect Matrix GND to micro:bit GND
3. Connect Matrix GND to GND of external power supply
4. Connect Matrix DIN to micro:bit P0
5. Connect Matrix VCC to VCC of external 5V power supply
6. Connect micro:bit to computer using USB cable
