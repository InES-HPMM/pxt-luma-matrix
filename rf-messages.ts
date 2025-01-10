/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    rf-messages.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    10.01.2025
 * -- Author:   ebep
 * --
 * ------------------------------------------------------------------
 */

namespace Lumatrix {
    //% blockId="RF_EncodeImage"
    //% block="Bitmap $image to Buffer"
    //% image.shadow="Image_8x8"
    //% group="Communication"
    function bitmapToBuffer(image: Image): Buffer {
        let imgBuffer = control.createBuffer(8); // Create an 8-byte buffer
        try {
            let imagewidth = image.width();
            let imageheight = image.height();

            for (let y = 0; y < imageheight; y++) {
                let line = 0; // Reset line for each row
                for (let x = 0; x < imagewidth; x++) {
                    if (image.pixel(x, y)) {
                        line = line | (1 << x); // Set the corresponding bit for the pixel
                    }
                }
                imgBuffer.setUint8(y, line); // Store the byte for the row in the buffer
            }
        } catch (e) {
            console.log(`bitmapToBuffer error: ${e}`);
        }

        serial.writeBuffer(imgBuffer); // Debugging: Write buffer to serial
        return imgBuffer;
    }

    //% blockId="RF_DecodeImage"
    //% block="Buffer $buf to Bitmap"
    //% imageLiteralColumns=8
    //% imageLiteralRows=8
    //% group="Communication"
    function bufferToBitmap(buf: Buffer): Image {
        let img = images.createImage(`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `); // Initialize an 8x8 image

        try {
            let imagewidth = img.width();
            let imageheight = img.height();

            for (let y = 0; y < imageheight; y++) {
                let line = buf.getUint8(y); // Get the byte for the row
                for (let x = 0; x < imagewidth; x++) {
                    if (line & (1 << x)) {
                        img.setPixel(x, y, true); // Set the pixel if the bit is 1
                    } else {
                        img.setPixel(x, y, false); // Clear the pixel if the bit is 0
                    }
                }
            }
        } catch (e) {
            console.log(`bufferToBitmap error: ${e}`);
        }

        return img;
    }


    //% blockId="RF_SendImage"
    //% block="Send $image with color %color"
    //% color.shadow="colorNumberPicker"
    //% image.shadow="Image_8x8"
    //% advanced=true group="Communication"
    export function sendImageWithColor(image: Image, color: number) {
        let msgBuf = bitmapToBuffer(image)
        let colors = [color >> 16 & 0xff, color >> 8 & 0xff, color & 0xff]
        let packagedBuffer = msgBuf.concat(Buffer.fromArray(colors))
        radio.sendBuffer(packagedBuffer)
    }


    //% blockId="RF_OnReceivedImage"
    //% block="on received image with color"
    //% draggableParameters="reporter"
    //% advanced=true group="Communication"
    export function onReceivedImage(callback: (image: Image, color: number) => void): void {
        radio.onReceivedBuffer(function (receivedBuffer: Buffer) {
            let color = 0xffffff; // Default color
            let imgBuffer = receivedBuffer.slice(0, 8); // First 8 bytes for image data
            let image = bufferToBitmap(imgBuffer); // Convert to image

            // Check if there's color data
            if (receivedBuffer.length >= 11) {
                let red = receivedBuffer.getUint8(8);
                let green = receivedBuffer.getUint8(9);
                let blue = receivedBuffer.getUint8(10);
                color = (red << 16) | (green << 8) | blue; // Combine RGB into a single number
            }

            // Trigger the callback with the parsed image and color
            callback(image, color);
        });
    }
}