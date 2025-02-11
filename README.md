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

### Using the Arduino CLI

Using `arduino-cli` and compiling the project is unfortunately a bit more involved than running `arduino-cli compile .` in the project directory but very instructive.
Below are some pointers to overcome common issues when using `arduino-cli`. Additionally, a `Makefile` is provided to simplify the process.

**Installing Dependencies**

When managing the project through `arduino-cli`, the dependencies are not installed automatically. You have to install them manually:

```bash
$> arduino-cli lib install SD FastLED WiFiNINA ArduinoJson
```

**Main sketch filename**

Compiling the project requires that the main sketch file has the same name as the project directory.

- Running `arduino-cli compile --fqbn [..] .` will fail if the main sketch file is not named the same as the repository -
that is, if the repository is called `Pixelmatrix`, the main sketch file should be called `Pixelmatrix.ino`.

**User permissions**

The flash may initially fail since the user typically does not have write permissions on the serial TTYs by default. This can be fixed by adding the user to the proper group (e.g. `dialout`, `uucp` or `tty`).

- Quick fix: `sudo chmod 666 /dev/ttyACM0` (or whatever the port is)
- Doing it properly:
  - Run `arduino-cli board list` to get the port of the Arduino, e.g. `/dev/ttyACM0`.
  - `ls -l /dev/ttyA*` to get the group of the device (`uucp` in my case).
  - `sudo usermod -aG uucp $USER` to add yourself to the group.
  - Log out and log back in to apply the changes.

**Monitoring the serial output**

Using `arduino-cli` to monitor the serial port, you are typically not fast enough to catch the sketch reporting its IP address.

- To circumvent this issue, a macro `DEBUG_SERIAL` can be defined which delays the setup of the sketch *until* a serial connection is established.
- To compile the sketch with the `DEBUG_SERIAL` macro, run `arduino-cli compile --fqbn [..] --build-property build.extra_flags="-DDEBUG_SERIAL" .`.

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
