# === CONFIGURATION ===
BOARD_FQBN = arduino:samd:nano_33_iot
# Make sure PORT is properly set. Run `arduino-cli board list` to see the port of the connected board.
PORT = /dev/ttyACM0
SKETCH = Pixelmatrix.ino
#DEFINES = -DDEBUG_SERIAL  # Comment out to disable debugging

# === COMMANDS ===
ARDUINO_CLI = arduino-cli
COMPILE_CMD = $(ARDUINO_CLI) compile --fqbn $(BOARD_FQBN) --build-property compiler.cpp.extra_flags="$(DEFINES)" .
UPLOAD_CMD = $(ARDUINO_CLI) upload --fqbn $(BOARD_FQBN) --port $(PORT) .
MONITOR_CMD = $(ARDUINO_CLI) monitor -p $(PORT) -c baudrate=115200

# === MAKE TARGETS ===
all: compile upload monitor

compile:
	@echo "Compiling project..."
	$(COMPILE_CMD)

upload: compile
	@echo "Uploading to board..."
	$(UPLOAD_CMD)

monitor:
	@echo "Opening serial monitor..."
	$(MONITOR_CMD)

clean:
	@echo "Cleaning build files..."
	rm -rf $(BUILD_DIR)

list:
	@echo "Listing connected Arduino boards..."
	$(ARDUINO_CLI) board list
