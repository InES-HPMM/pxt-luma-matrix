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



namespace lumaMatrix {

    /**
     * Enum with predefined datatypes in messages sent over radio
     */
    //% blockId="ZHAW_RF_DataTypeEnum" block="%dataType"
    //% blockHidden=true
    //% subcategory="Communication"
    export enum eDataType {
        //% block="unknown"
        Unknown = 0,
        //% block="bitmap"
        Bitmap = 1,
        //% block="color image"
        RGBImage = 2,
        //% block="pixel (x,y)"
        Pixel = 3
    }

    /**
     * Enum with predefined colours to reduce packet size over radio
     */
    //% blockId="ZHAW_RF_ColorsEnum" block="%color"
    //% blockHidden=true
    //% subcategory="Communication"
    export enum eColorPalette {
        //% block="red"
        Red = 0,
        //% block="green"
        Green = 1,
        //% block="blue"
        Blue = 2,
        //% block="orange"
        Orange = 3,
        //% block="yellow"
        Yellow = 4,
        //% block="purple"
        Purple = 5,
        //% block="white"
        White = 6,
        //% block="black"
        Black = 7
    }

    const predefinedPalette = [
        [255, 0, 0],        // Red
        [0, 255, 0],        // Green
        [0, 0, 255],        // Blue
        [255, 165, 0],      // Orange
        [255, 255, 0],      // Yellow
        [238, 130, 238],    // Purple
        [255, 255, 255],    // White
        [0, 0, 0]           // Black
    ];

    // Use maximum dimension to ensure sufficient memory allocation
    let incomImgBuffer: Buffer = Buffer.create(3 * Math.max(matrixWidth, matrixHeight));

    /**
     * Get element from enum with predefined datatypes in messages sent over radio
     */
    //% blockId="ZHAW_RF_DataType" 
    //% block="datatype $dataType"
    //% dataType.defl=lumaMatrix.eDataType.RGBImage
    //% subcategory="Communication"
    export function getDataType(dataType: eDataType): eDataType {
        return dataType
    }

    /**
     * Get element from enum with predefined colours to reduce packet size over radio
     */
    //% blockId="ZHAW_RF_ColorPicker" 
    //% block="color palette $color"
    //% color.defl=lumaMatrix.eColorPalette.Yellow
    //% subcategory="Communication"
    export function getColorPalette(color: eColorPalette): number {
        let R = predefinedPalette[color][0] << 16 
        let G = predefinedPalette[color][1] << 8 
        let B = predefinedPalette[color][2];
        return (R | G | B)
    }

    /**
     * Encode a bitmap into a buffer which can be transmitted over radio
     */
    //% blockId="ZHAW_RF_EncodeImage"
    //% block="bitmap $image to buffer"
    //% image.shadow="ZHAW_Image_8x8"
    //% subcategory="Communication"
    function bitmapToBuffer(image: Image): Buffer {
        // Create a buffer with one byte per row using maximum dimension for safety
        let imgBuffer = control.createBuffer(Math.max(matrixWidth, matrixHeight)); 
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

    /**
     * Decode a received buffer back into a bitmap
     */
    //% blockId="ZHAW_RF_DecodeImage"
    //% block="buffer $buf to bitmap"
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


    /**
     * Send one pixel in single colour to other Luma Matrix over radio. Radio channel needs to be set in advance
     */
    //% blockId="ZHAW_RF_SendPixel"
    //% block="send pixel x $x y $y in color $color"
    //% x.min=0 x.max=7
    //% y.min=0 y.max=7
    //% color.shadow="colorNumberPicker"
    //% subcategory="Communication" weight=110
    export function sendPixel(x: number, y: number, color: number) {
        let data = Buffer.fromArray([eDataType.Pixel, x, y])
        let colors = [color >> 16 & 0xff, color >> 8 & 0xff, color & 0xff]
        let packagedBuffer = data.concat(Buffer.fromArray(colors))
        radio.sendBuffer(packagedBuffer)
    }


    /**
     * Send bitmap in single colour to other Luma Matrix over radio. Radio channel needs to be set in advance
     */
    //% blockId="ZHAW_RF_SendImage"
    //% block="send $image in color %color || layer $layer"
    //% color.shadow="colorNumberPicker"
    //% image.shadow="ZHAW_Image_8x8"
    //% layer.shadow="toggleOnOff" layer.defl=true
    //% subcategory="Communication" weight=110
    export function sendImageWithColor(image: Image, color: number, layer?: boolean) {
        let msgBuf = bitmapToBuffer(image)
        let colors = [color >> 16 & 0xff, color >> 8 & 0xff, color & 0xff]
        let packagedBuffer = msgBuf.concat(Buffer.fromArray(colors))
        packagedBuffer = packagedBuffer.concat(Buffer.fromArray([layer ? 1 : 0]))

        radio.sendBuffer(packagedBuffer)
    }


    /**
     * Send compressed pixel buffer in colors of pallette to other Luma Matrix over radio. Radio channel needs to be set in advance
     */
    //% blockId="ZHAW_RF_SendPixelBuffer"
    //% block="send compressed pixel buffer $buf"
    //% buf.shadow="ZHAW_Matrix_GetPixelBuffer"
    //% subcategory="Communication" weight=109
    export function sendPixelBuffer(buf: Buffer) {
        let compressed = compressRGB(buf)
        let upper = Buffer.fromArray([0xa0]).concat(compressed.slice(0, 12))
        let lower = Buffer.fromArray([0xa1]).concat(compressed.slice(12, 24))
        radio.sendBuffer(upper)
        basic.pause(1)
        radio.sendBuffer(lower)
    }


    /**
     * Listen on incomming radio messages from other Luma Matrix. Radio channel needs to be set in advance
     */
    //% blockId="ZHAW_RF_OnReceived"
    //% block="on received matrix buffer"
    //% draggableParameters="reporter"
    //% subcategory="Communication" weight=120
    export function onReceivedMatrix(callback: (dataType: number, receivedBuffer: Buffer) => void): void {
        radio.onReceivedBuffer(function (receivedBuffer: Buffer) {
            let dataLen = receivedBuffer.length
            let dataType = eDataType.Unknown
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
            } else {
                dataType = receivedBuffer.getUint8(0)
            }

            serialDebugMsg("Type: " + dataType + ", Buffer: " + dataLen)
            callback(dataType, receivedBuffer)
        });
    }


    /**
     * Parse received message for pixel and applies to luma matrix
     */
    //% blockId="ZHAW_RF_ParsePixel"
    //% block="set pixel from $receivedBuffer"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function parsePixel(receivedBuffer: Buffer): void {
        let dataLen = receivedBuffer.length
        let dataType = receivedBuffer.getUint8(0)

        if(dataType != eDataType.Pixel){
            return
        }
        
        let x = receivedBuffer.getUint8(1)
        let y = receivedBuffer.getUint8(2)
        let red = receivedBuffer.getUint8(3);
        let green = receivedBuffer.getUint8(4);
        let blue = receivedBuffer.getUint8(5);

        lumaMatrix.setOnePixelRGB(x, y, red, green, blue);
    }


    /**
     * Parse received message for image
     */
    //% blockId="ZHAW_RF_ParseImage"
    //% block="image from $receivedBuffer"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function parseImage(receivedBuffer: Buffer): Image {
        let dataLen = receivedBuffer.length
        let dataType = eDataType.Unknown

        dataType = eDataType.Bitmap
        let imgBuffer = receivedBuffer.slice(0, Math.max(matrixWidth, matrixHeight)); // First bytes for image data (one byte per row)
        let image = bufferToBitmap(imgBuffer); // Convert to image
        let layer = receivedBuffer.getUint8(9) ? true : false;

        return image
    }


    /**
     * Parse received message for colour
     */
    //% blockId="ZHAW_RF_ParseForColor"
    //% block="color from $receivedBuffer"
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

    /**
     * Parse received message for layer
     */
    //% blockId="ZHAW_RF_ParseForLayer"
    //% block="layer from $receivedBuffer"
    //% draggableParameters="reporter"
    //% subcategory="Communication"
    export function parseBufferForLayer(receivedBuffer: Buffer): boolean {
        let layer = false; // Default layer

        // Check if there's color data
        if (receivedBuffer.length >= 11) { // TODO why 11?
            layer = receivedBuffer.getUint8(11) ? true : false;
        }

        return layer
    }

    /**
     * Parse received message for coloured image
     */
    //% blockId="ZHAW_RF_ParseReceivedColorImage"
    //% block="color image from $receivedBuffer"
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


    // Function to compress a buffer of 192 bytes to 24 bytes // TODO use matrixWidth and matrixHeight
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


    // Function to decompress a buffer of 24 bytes back to 192 bytes // TODO use matrixWidth and matrixHeight
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