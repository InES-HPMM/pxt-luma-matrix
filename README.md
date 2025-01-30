
> Open this page at [https://ines-hpmm.github.io/ines-led-matrix/](https://ines-hpmm.github.io/ines-led-matrix/)

## Use as an Extension

This repository can be added as an **extension** in MakeCode.

* Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* Click on **New Project**
* Click on **Extensions** under the gear menu
* Search for **https://github.com/ines-hpmm/ines-led-matrix** and import

## Initialize Matrix
The matrix must be initialized at the beginning of every program. There is a block for this:
```blocks
LumaMatrix.initializeMatrix(DigitalPin.P0, 135)

```

Example
The available blocks can display images and text, as well as control individual pixels.
```blocks
LumaMatrix.initializeMatrix(DigitalPin.P0, 135)
LumaMatrix.scrollText("LUMA MATRIX", 0xff00FF, 90)
LumaMatrix.showImage(LumaMatrix.matrix8x8(`
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

## Edit This Project

To edit this repository in MakeCode:

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* Click on **Import** and then **Import URL**
* Enter **https://github.com/ines-hpmm/ines-led-matrix** and click Import

## Update Translation
The block translations are stored in the `_locales/de` folder. To update the translation, the relevant files can be modified in MakeCode. For major changes or newly added blocks, the [MakeCode localization guide](https://makecode.com/extensions/localization) can be used.

```shell
# NodeJS and npm must be installed
npm install -g pxt
pxt target microbit
pxt gendocs --locs
```

## Supported targets

* for PXT/microbit

## License

MIT

#### Metadata (used for search and rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
