
> Open this page at [https://ines-hpmm.github.io/pxt-luma-matrix/](https://ines-hpmm.github.io/pxt-luma-matrix/)

## About the Project

The Luma Matrix is a Workshop by ZHAW to play and create with coding. The center of the workshop is an 8 by 8 pixel matrix controlled with a micro:bit. 
Use the blocks from the extension to build whatever you have in mind. Draw images, show text, display the time, or even connect it to other Luma Matrices.

## Use as an Extension

This repository can be added as an **extension** in MakeCode.

* Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* Click on **New Project**
* Click on **Extensions** under the gear menu
* Search for **https://github.com/ines-hpmm/pxt-luma-matrix** and import

### Initialize Matrix
The matrix must be initialized at the beginning of every program. There is a block for this:
```blocks
lumaMatrix.initializeMatrix(135)

```

## Example
The available blocks can display images and text, as well as control individual pixels.
```blocks
lumaMatrix.initializeMatrix(135)
lumaMatrix.scrollText("LUMA MATRIX", 0xff00FF, 90)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . # # . . # # .
    . # # . . # # .
    . . . . . . . .
    # . . . . . . #
    . # . . . . # .
    . . # # # # . .
    . . . . . . . .
    `), 0xffff00)
```

### Communication
```blocks
radio.setGroup(25)
lumaMatrix.initializeMatrix(135)
lumaMatrix.scrollText("LUMA MATRIX", 0xff00FF, 90)
lumaMatrix.showImage(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . # # . . # # .
    . # # . . # # .
    . . . . . . . .
    # . . . . . . #
    . # . . . . # .
    . . # # # # . .
    . . . . . . . .
    `), 0xffff00)


loops.everyInterval(5000, function() {
    lumaMatrix.sendImageWithColor(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . # # . . # # .
    . # # . . # # .
    . . . . . . . .
    # . . . . . . #
    . # . . . . # .
    . . # # # # . .
    . . . . . . . .
    `), 0xffff00)
    basic.pause(300)
    lumaMatrix.sendImageWithColor(lumaMatrix.matrix8x8(`
    . . . . . . . .
    . # # . . # # .
    . # # . . # # .
    . . . . . . . .
    . . . . . . . .
    . # # # # # # .
    . . . . . . . .
    . . . . . . . .
    `), 0xffff00)
})

lumaMatrix.onReceivedMatrix(function(dataType: number, receivedBuffer: Buffer) {
    if (dataType == lumaMatrix.getDataType(lumaMatrix.eDataType.Bitmap)) {
        lumaMatrix.showImage(lumaMatrix.parseImage(receivedBuffer), lumaMatrix.parseBufferForColor(receivedBuffer))
    }
})

```


## Edit This Project

To edit this repository in MakeCode:

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* Click on **Import** and then **Import URL**
* Enter **https://github.com/ines-hpmm/pxt-luma-matrix** and click Import

## Update Translation
The block translations are stored in the `_locales/de` folder. To update the translation, the relevant files can be modified in MakeCode. For major changes or newly added blocks, the [MakeCode localization guide](https://makecode.com/extensions/localization) can be used.

```shell
# NodeJS and npm must be installed
npm install -g pxt
pxt target microbit
pxt install
pxt gendocs --locs
```

## Supported targets

* for PXT/microbit

## License

MIT

#### Metadata (used for search and rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
