# Challenge 4 - Drahtlose Kommunikation
Der pico:bit auf der Rückseite der Lumatrix kann auch drahtlos kommunizieren. In dieser Challenge wirst du lernen, wie du die Lumatrix mit einem anderen pico:bit kommunizieren lassen kannst. Die Kommunikation efolgt über das 2.4 GHz Frequenzband, also wie WLAN und Bluetooth. 

## Blöcke
MakeCode bietet in der Kategorie Funk eigene Blöcke zum senden von Zahlen oder Textnachrichten. In der Kategorie "Kommunikation" der Luma Matrix Erweiterung findest du die Blöcke zum Senden und Empfangen von Daten relevant für die Lumatrix. Die jeweiligen Blöcke enthalten ein eigenes Protokoll um zu definieren, was gesendet wird. 
 - Bitmap: Ein Bild, das zeigt welche LEDs leuchten sollen. Die Farbe für alle wird dabei mitgesendet.
 - Farbbild: Ein Bild, das zeigt welche LEDs leuchten sollen und in welcher Farbe.
 - Pixel (x,y): Ein einzelnes Pixel, das leuchten soll. Die Farbe wird mitgesendet.
 - Unbekannt: Alle anderen Daten, die nicht in die anderen Kategorien passen können so manuell definiert werden.

```admonish info title="Erläuterung zum Senden" collapsible=true
Bitmap: Sende Bild 8x8 in Farbe
 - Sende welche Pixel in der definierten Farbe leuchten sollen. Als optionaler Parameter "Layer" kannst du angeben, ob das Bild das vorherige Bild ergänzen oder ersetzen soll.

Farbbild: Sende Pixel Buffer (komprimiert)
 - Dieser Block sendet einen "Screenshot" der Lumatrix in reduzierter Farbauflösung. Die Farben werden auf Rot, Orange, Gelb, Grün, Blau, Violett, Weiss, Schwarz reduziert. Der Pixel Buffer ist der aktuelle Zustand der Lumatrix.

Pixel: Sende Pixel (x,y) in Farbe
 - Sende ein einzelnes Pixel in der definierten Farbe. Die Farbe wird mitgesendet

```

```admonish info title="Erläuterung zum Empfangen" collapsible=true
Empfang-Event (Interrupt): Wenn Matrix Buffer empfangen (dataType, receivedBuffer)
 - Dieser Block wird aufgerufen, wenn ein Bild empfangen wurde. Zwei Parameter werden mitgesendet.
    - dataType: Der Typ der Nachricht, die empfangen wurde
    - receivedBuffer: Der Buffer, der die Daten enthält. Aus diesem Buffer kannst du die Daten extrahieren.

Bitmap: Extrahiere Bild aus Buffer
 - Dieser Block extrahiert die Bitmap-Daten aus dem Buffer. Du kannst die Daten dann verwenden, um das Bild auf der Lumatrix anzuzeigen.

Bitmap: Extrahiere Farbe aus Buffer
 - Dieser Block extrahiert die Farbe aus dem Buffer. Du kannst die Farbe dann verwenden, um das Bild auf der Lumatrix anzuzeigen.

Bitmap: Extrahiere Layer aus Buffer
 - Dieser Block extrahiert den Layer aus dem Buffer. Du kannst den Layer dann verwenden, um das Bild auf der Lumatrix anzuzeigen.

Extrahiere RGB-Bild aus Buffer
 - Dieser Block extrahiert die RGB-Daten aus dem Buffer. Du kannst die Daten dann verwenden, um das Bild auf der Lumatrix anzuzeigen.

Pixel (x,y): Setze empfangenen Pixel aus Buffer
  - Dieser Block extrahiert die Pixel-Daten aus dem Buffer und setzt den Pixel auf der Lumatrix.
```

## Aufgabe
 - Suche dir einen Team-Partner mit einer weiteren Lumatrix.
 - Erstelle ein neues Projekt, adaptiere ein vorhanenes Projekt oder nutze die Vorlage aus [Challenge 1](https://makecode.microbit.org/S20868-92452-49202-31290).
 - Setze deine Lumatrix und die von deinem Partner auf den selben Kanal.
 - Nutzen den Jostick um je nach Richtung ein Bild an deinen Partner zu senden.
 - Dein Partner soll das Empfangen 


```blocks
radio.setGroup(25)
lumaMatrix.initializeMatrix(127)

lumaMatrix.onReceivedMatrix(function (dataType, receivedBuffer) {
    if (dataType == lumaMatrix.getDataType(lumaMatrix.eDataType.Bitmap)) {
    	
    }
})
```




<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>