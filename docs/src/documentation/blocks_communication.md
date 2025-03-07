# Communication Blocks

The Luma Matrix extension provides blocks for wireless communication between multiple micro:bit devices equipped with Luma Matrix displays. This allows you to send images and color patterns from one device to another using the micro:bit's built-in radio capabilities.

## Setting Up Communication

Before using any communication blocks, you need to set up the radio channel on both the sending and receiving micro:bits. All devices that want to communicate must be on the same radio channel.

```blocks
radio.setGroup(1)
```

## Available Communication Blocks

### Send Image with Color

This block allows you to send a monochrome bitmap image with a specified color to another Luma Matrix. The receiving device will display the image in the chosen color.

Example usage:
```blocks
lumaMatrix.sendImageWithColor(lumaMatrix.matrix8x8(`
        . . . . . . . .
        . # # . . # # .
        . # # . . # # .
        . . . . . . . .
        # . . . . . . #
        . # . . . . # .
        . . # . . # . .
        . . . # # . . .
        `), 0xff0000)
```

### Send Compressed Pixel Buffer

This block sends a full-color image by compressing the pixel buffer before transmission. This is useful when you want to send images with multiple colors.

Example usage:
```blocks
lumaMatrix.sendPixelBuffer(lumaMatrix.getPixelBuffer())
```

### Receive Matrix Data

This block sets up an event handler that triggers whenever matrix data is received over radio. The handler provides two parameters:
- `dataType`: Indicates whether the received data is a bitmap (1) or RGB image (2)
- `receivedBuffer`: The actual data buffer containing the image information

Example usage:
```blocks
lumaMatrix.onReceivedMatrix(function (dataType, receivedBuffer) {
    if (dataType == 1) {
        let image = lumaMatrix.parseImage(receivedBuffer)
        let color = lumaMatrix.parseBufferForColor(receivedBuffer)
        lumaMatrix.showImage(image, color)
    } else if (dataType == 2) {
        lumaMatrix.showPixelBuffer(lumaMatrix.parseColorImage(receivedBuffer))
    }
})
```

### Color Palette

For efficient communication, you can use predefined colors from the color palette:

- Red
- Green
- Blue
- Orange
- Yellow
- Purple
- White
- Black

Example using color palette:
```blocks
lumaMatrix.sendImageWithColor(myImage, lumaMatrix.getColorPalette(lumaMatrix.eColorPalette.Yellow))
```

## Technical Details

The communication protocol uses data compression to efficiently transmit images:
- Monochrome images are compressed to 8 bytes (1 bit per pixel)
- Color information is sent as RGB values (3 bytes)
- Full RGB images are compressed from 192 bytes to 24 bytes
- Large buffers are split into two packets for reliable transmission

## Tips and Best Practices

1. Always ensure all devices are on the same radio channel
2. Add a small delay (1-2ms) between sending multiple packets
3. Consider using the predefined color palette for more efficient communication
4. Handle both bitmap and RGB image types in your receive handlers
5. Test communication in areas with minimal radio interference

## Troubleshooting

If you experience issues with communication:

1. Verify that all devices are on the same radio channel
2. Check if the devices are within range (typically 10-20 meters)
3. Ensure the sending device has completed transmission before sending the next image
4. Monitor the serial output for debugging messages
5. Consider reducing the radio group number if there's interference

<!-- <script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>
 -->

<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>
<script src="../assets/js/makecode-init.js"></script>