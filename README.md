# Pixelmatrix
Code, PCB and 3D Printing files for the TechNickTräff Pixelmatrix.

## TODOs
- Make Animations work (code is there but memory limits kicks)
- Make it possible to save files bigger than 4000bytes via the web interface (memory limits again)
- The whole Arduino codebase is a mess ;)
- Delete is not yet implemented on the arduino
- Maybe a better debounce implementation for the action button?

## Installation
1. Copy the contents of the __sd__ Folder to the root of the SD Card on the LED Matrix. (And check no hidden .DS_STORE files were created in the gallery folder)
2. Copy the `secrets.h.example` file to `secrets.h` and add your WiFi Information.
3. Use the [Arduino IDE](https://www.arduino.cc/en/software) or the [Arduino CLI](https://www.arduino.cc/pro/software-pro-cli/) to compile and flash the LEDMatrix.ino file to your Arduino.
4. Use the Serial Monitor in the Arduino IDE (Under Tools->Serial Monitor) or Arduino CLI to connect to the LED Matrix to retrieve the current IP Address.
5. Using your Webbrowser navigate to the IP Address (http only) and change the Settings as you like them.
6. If you have a somewhat smart router it might be beneficial to add a static DHCP lease so the Matrix always has the same ip.

## Build Web
As the Arduino is quite slow it is beneficial to minify the JavaScript.
Install the necessary Build Tools using npm.
Afterwards run `npm run build` to generate the correct files in the __sd__ Folder.

## Build Arduino
Either click the Button in the Arduino IDE or use the Arduino CLI command `arduino-cli compile`.

## Knowlege base
### [Custom IDE] Arduino.h not found
Arduino.h is from the [Arduino Core Project](https://github.com/arduino/ArduinoCore-avr/blob/master/cores/arduino/Arduino.h).
It is automatically installed with the Arduino IDE and can then be added to your `CPATH` or you can clone the repository and add that to your `CPATH` (You have to download more files than just Arduino.h).

### Testing the Web Page locally
You have to use a simple web server like `php -S`, `npx serve` or other. Whatever you have installed. (Just opening the index.html does not work due to webmodules requiring the same origin policy.)
You can also use the `api_endpoint` key in the __main.mjs__ file to point the local served web file to your Arduino. Here is an example:
```js
const settings = { api_endpoint: "http://192.168.1.41"};
```

### The Arduino is stuck/ doesn't respond/ cannot be flashed
You can reset the Arduino using the button on the back of the Arduino. Pressing it 2 times quickly in sucession will lead to the Arduino halting in the bootloader. (Press the button a third time to exit the boot loader.)
Also, here are some reasons how i've crashed my Arduino, it might help.

#### Reasons why I have crashed the Arduino
- Too many read requests to the sd library in quick sucession (every 1000ms)
- Accessing empty memory due to passing JsonArray which internally points to a JsonDoc and the JsonDoc gets dereferenced.
- Accidental endless loops ;)
- Using too much Memory

### Explanation of weird language constructs
```
  while (true)
    ;
```

Since the Arduino runs a continuous loop, when encountering unrecoverable errors this endless while loop will lead to the watchdog terminating the arduino process.
It is the only option (that i know of) to stop executing the programm.
