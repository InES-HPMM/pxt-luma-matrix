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

    //% blockId="RF_DataTypeEnum" block="%dataType"
    //% blockHidden=true
    //% dataType.shadow="dropdown"
    //% subcategory="Communication"
    export enum eDataType {
        Unkown = 0,
        Bitmap = 1,
        RGBImage = 2
    }


    //% blockId="RF_ColorsEnum" block="%color"
    //% blockHidden=true
    //% color.shadow="dropdown"
    //% subcategory="Communication"
    export enum eColorPalette {
        Red = 0,
        Green = 1,
        Blue = 2,
        Orange = 3,
        Yellow = 4,
        Violet = 5,
        White = 6,
        Black = 7
    }

    const predefinedPalette = [
        [255, 0, 0],        // Red
        [0, 255, 0],        // Green
        [0, 0, 255],        // Blue
        [255, 165, 0],      // Orange
        [255, 255, 0],      // Yellow
        [238, 130, 238],    // Violet
        [255, 255, 255],    // White
        [0, 0, 0]           // Black
    ];

    let incomImgBuffer: Buffer = Buffer.create(24);

    //% blockId="RF_DataType" 
    //% block="DataType $dataType"
    //% dataType.shadow="dropdown" dataType.defl=eDataType.RGBImage
    //% subcategory="Communication"
    export function getDataType(dataType: eDataType): eDataType {
        return dataType
    }

    //% blockId="RF_ColorPicker" 
    //% block="Color Palette $color"
    //% color.shadow="dropdown"
    //% color.defl=eColorPalette.Yellow
    //% subcategory="Communication"
    export function getColorPalette(color: eColorPalette): number {
        let R = predefinedPalette[color][0] << 16 
        let G = predefinedPalette[color][1] << 8 
        let B = predefinedPalette[color][2];
        return (R | G | B)
    }

    //% blockId="RF_EncodeImage"
    //% block="Bitmap $image to Buffer"
    //% image.shadow="Image_8x8"
    //% subcategory="Communication"
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
    //% subcategory="Communication"
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
    //% block="Send $image in color %color"
    //% color.shadow="colorNumberPicker"
    //% image.shadow="Image_8x8"
    //% subcategory="Communication"
    export function sendImageWithColor(image: Image, color: number) {
        let msgBuf = bitmapToBuffer(image)
        let colors = [color >> 16 & 0xff, color >> 8 & 0xff, color & 0xff]
        let packagedBuffer = msgBuf.concat(Buffer.fromArray(colors))
        radio.sendBuffer(packagedBuffer)
    }

    //% blockId="RF_SendPixelBuffer"
    //% block="Send compressed Pixel Buffer $buf"
    //% buf.shadow="Matrix_GetPixelBuffer"
    export function sendPixelBuffer(buf: Buffer) {
        let compressed = compressRGB(buf)
        let upper = Buffer.fromArray([0xa0]).concat(compressed.slice(0, 12))
        let lower = Buffer.fromArray([0xa1]).concat(compressed.slice(12, 24))
        radio.sendBuffer(upper)
        basic.pause(1)
        radio.sendBuffer(lower)
    }

    //% blockId="RF_OnReceived"
    //% block="on received matrix buffer"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function onReceivedMatrix(callback: (dataType: number, receivedBuffer: Buffer) => void): void {
        radio.onReceivedBuffer(function (receivedBuffer: Buffer) {
            let dataLen = receivedBuffer.length
            let dataType = eDataType.Unkown
            if (dataLen > 12) {
                if (incomImgBuffer.getUint8(0) == 0xa1 && receivedBuffer.getUint8(0) == 0xa0) {
                    let upper = receivedBuffer.slice(1, 13)
                    let lower = incomImgBuffer.slice(1, 13)
                    let full = upper.concat(lower)
                    incomImgBuffer.fill(0, 0, 24)
                    dataType = eDataType.RGBImage
                    callback(dataType, full)
                } else if (incomImgBuffer.getUint8(0) == 0xa0 && receivedBuffer.getUint8(0) == 0xa1) {
                    let lower = receivedBuffer.slice(1, 13)
                    let upper = incomImgBuffer.slice(1, 13)
                    let full = upper.concat(lower)
                    incomImgBuffer.fill(0, 0, 24)
                    dataType = eDataType.RGBImage
                    callback(dataType, full)
                } else {
                    incomImgBuffer = receivedBuffer
                    return
                }
            } else if (dataLen > 8) {
                dataType = eDataType.Bitmap
            }

            serialDebugMsg("Type: " + dataType + ", Buffer: " + dataLen)
            callback(dataType, receivedBuffer)
        });
    }

    //% blockId="RF_ParseImage"
    //% block="parse $receivedBuffer for image"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function parseImage(receivedBuffer: Buffer): Image {
        let dataLen = receivedBuffer.length
        let dataType = eDataType.Unkown

        dataType = eDataType.Bitmap
        let imgBuffer = receivedBuffer.slice(0, 8); // First 8 bytes for image data
        let image = bufferToBitmap(imgBuffer); // Convert to image

        return image
    }

    //% blockId="RF_ParseForColor"
    //% block="parse $receivedBuffer for color"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function parseBufferForColor(receivedBuffer: Buffer): number {
        let dataLen = receivedBuffer.length
        let color = 0xffffff; // Default color

        // Check if there's color data
        if (receivedBuffer.length >= 11) {
            let red = receivedBuffer.getUint8(8);
            let green = receivedBuffer.getUint8(9);
            let blue = receivedBuffer.getUint8(10);
            color = (red << 16) | (green << 8) | blue; // Combine RGB into a single number
        }

        return color
    }


    //% blockId="RF_ParseReceivedColorImage"
    //% block="Parse $receivedBuffer for color image"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function parseColorImage(receivedBuffer: Buffer): Buffer {
        let dataLen = receivedBuffer.length
        if (dataLen < 13) {
            serialDebugMsg("Colored image to short " + dataLen)
            return Buffer.create(0)
        }
        let decomp: Buffer = decompressRGB(receivedBuffer)
        serialDebugMsg("Decompressed " + dataLen + "->" + decomp.length)
        return decomp
    }


    // Function to compress a buffer of 192 bytes to 24 bytes
    function compressRGB(buffer: Buffer): Buffer {
        if (buffer.length !== 192) {
            serialDebugMsg("Buffer length must be 192 bytes");
            return Buffer.create(0);
        }

        let compressed = Buffer.create(24);
        for (let i = 0; i < 64; i++) {
            let byte1 = 0, byte2 = 0, byte3 = 0;
            for (let j = 0; j < 8; j++) {
                let pixelIndex = i * 3 * 8 + j * 3;
                let r = (buffer.getUint8(pixelIndex) >> 7) & 0x01;
                let g = (buffer.getUint8(pixelIndex + 1) >> 7) & 0x01;
                let b = (buffer.getUint8(pixelIndex + 2) >> 7) & 0x01;

                byte1 |= (r << (7 - j));
                byte2 |= (g << (7 - j));
                byte3 |= (b << (7 - j));
            }
            compressed.setUint8(i * 3, byte1);
            compressed.setUint8(i * 3 + 1, byte2);
            compressed.setUint8(i * 3 + 2, byte3);
        }

        return compressed;
    }

    // Function to decompress a buffer of 24 bytes back to 192 bytes
    function decompressRGB(buffer: Buffer): Buffer {
        if (buffer.length !== 24) {
            serialDebugMsg("Buffer length must be 24 bytes");
            return Buffer.create(0);
        }

        let decompressed = Buffer.create(192);
        for (let i = 0; i < 64; i++) {
            let byte1 = buffer.getUint8(i * 3);
            let byte2 = buffer.getUint8(i * 3 + 1);
            let byte3 = buffer.getUint8(i * 3 + 2);
            for (let j = 0; j < 8; j++) {
                let r = (byte1 >> (7 - j)) & 0x01;
                let g = (byte2 >> (7 - j)) & 0x01;
                let b = (byte3 >> (7 - j)) & 0x01;

                let pixelIndex = i * 3 * 8 + j * 3;
                decompressed.setUint8(pixelIndex, r * 255);
                decompressed.setUint8(pixelIndex + 1, g * 255);
                decompressed.setUint8(pixelIndex + 2, b * 255);
            }
        }

        return decompressed;
    }
}