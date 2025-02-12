#include <SD.h>
#include <avr/pgmspace.h>
#include <FastLED.h>
#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include <ArduinoJson.h>
#include "secrets.h"

#define DATA_PIN 6    // Digital Pin 6
#define BUTTON_PIN 2  // Digital Pin 2
#define SD_CS_PIN 4   // Digital Pin 4
#define NUM_LEDS 256
#define BRIGHTNESS 255
#define LED_TYPE WS2815
#define COLOR_ORDER GRB
#define COLS 16
#define WEB_DIR "/web"

const int MAX_SELECTION = 12;

CRGB leds[NUM_LEDS];

long lastDebounceTime = 0;
long debounce = 200; // 0.2s
File gallery;

char ssid[] = SSID;
char pass[] = PASSWORD;
int keyIndex = 0;

int status = WL_IDLE_STATUS;
WiFiServer server(80);

struct Request {
  String path;
  String query;
  String body;
};

//struct Animation {
//  int id;
//  int frame_amount;
//  int timing;
//  JsonDocument data;
//};
struct Animation {
    int id;
    int timing;
    int frame_amount;
    File file;  // Keep reference to the open file
    int currentFrameIndex;
    //unsigned long frameDataPosition;
    CRGB frameBuffer[16 * 16];  // Store only one frame at a time
};


Animation current_animation;

void setup() {
  ////// LED STRIP
  delay(3000);  // power-up safety delay
  Serial.begin(9600);
  
  #ifdef DEBUG_SERIAL
  while (!Serial);  // Wait for serial port to connect
  #endif

  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  ////// End LED STRIP

  ///// Action Button Interrupt
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonToggled, RISING);
  //// End Action Button

  ////// WIFI
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println(F("Communication with WiFi module failed!"));
    while (true)
      ;
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println(F("Please upgrade the firmware"));
  }

  while (status != WL_CONNECTED) {
    Serial.print(F("Attempting to connect to Network named: "));
    Serial.println(ssid);

    status = WiFi.begin(ssid, pass);
    delay(10000); // Slow WiFi Module >.<
  }
  server.begin();
  printWifiStatus();
  /////// END WIFI

  /////// SD
  if(!SD.begin(SD_CS_PIN)){
    Serial.println(F("SD init failed!"));
    while (true)
      ;
  }

  gallery = SD.open("/gallery");
  if(gallery) {
    File selectedFile =  gallery.openNextFile();
    if (! selectedFile) {
      Serial.println(F("You have to at least have one animation in the /gallery directory"));
      while(true)
        ;
    }
    loadAnimation(selectedFile);
  } else {
    Serial.println(F("Please create the /gallery directory on the sd card"));
    while(true)
      ;
  }
  /////// END SD
}

//void drawBitmap(JsonDocument animation, int index) {
//
//  int row;
//  int pixelIndex;
//
//  FastLED.clear();
//
//  for (int i = 0; i < NUM_LEDS; i += COLS) {  // i is the pixel index, incremented by the length of a row
//    for (int j = 0; j < COLS; j++) {          // j is the column index, always traversed from 0 to COLS
//      row = i / COLS;                               // row is the row index, ranging from 0 to 15
//      pixelIndex = row % 2 == 0 ? j : COLS - j - 1; // pixelIndex is j translated depending on even/odd row
//
//      const char *p = animation["data"][index][i + pixelIndex].as<const char*>();
//      leds[i + pixelIndex] = strtol(p+1, NULL, 16); // p+1 to skip char '#' at index 0, strtol with base 16 to convert hex to long
//    }
//  }
//
//  FastLED.show();
//}

void drawBitmap(CRGB *bitmap) {
  int row;
  int pixelIndex;

  FastLED.clear();
  for (int i = 0; i < NUM_LEDS; i += COLS) {  // i is the pixel index, incremented by the length of a row
    for (int j = 0; j < COLS; j++) {          // j is the column index, always traversed from 0 to COLS
      row = i / COLS;                               // row is the row index, ranging from 0 to 15
      pixelIndex = row % 2 == 0 ? j : COLS - j - 1; // pixelIndex is j translated depending on even/odd row

      leds[i + pixelIndex] = bitmap[i + pixelIndex];
    }
  }
  FastLED.show();
}

void drawAnimation(Animation &animation) {
    int frameIndex = (millis() / animation.timing) % animation.frame_amount;

    // Only reload the frame if it's different from the last one
    if (frameIndex != animation.currentFrameIndex) {
        animation.currentFrameIndex = frameIndex;
        loadFrame(frameIndex);  // ✅ Load only the required frame
    }

    drawBitmap(animation.frameBuffer);
}
void loadFrame(int frameIndex) {
    if (!current_animation.file) {
        Serial.println("No file to load frame from!");
        return;
    }

    Serial.print("Loading frame at index ");
    Serial.println(frameIndex);

    // ✅ Create a filter to extract only the required frame
    StaticJsonDocument<128> filter;
    filter["data"] = true;  // Load only the "data" field, NOT the whole JSON

    // ✅ Reset file before loading JSON
    current_animation.file.seek(0);

    // ✅ Use a large enough buffer to store frame data
    StaticJsonDocument<4096> frameDoc;

    // ✅ Parse JSON using filter (isolates `data` field)
    DeserializationError error = deserializeJson(frameDoc, current_animation.file, DeserializationOption::Filter(filter));

    if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        return;
    }

    // ✅ Get the `data` array (all frames)
    JsonArray frames = frameDoc["data"].as<JsonArray>();

    if (frames.isNull()) {
        Serial.println("Frame data is null!");
        return;
    }

    // ✅ Get the requested frame
    if (frameIndex >= frames.size()) {
        Serial.println("Requested frame index is out of range!");
        return;
    }

    JsonArray frame = frames[frameIndex].as<JsonArray>();

    if (frame.isNull()) {
        Serial.println("Frame is null!");
        return;
    }

    if (frame.size() != 16 * 16) {
        Serial.println("Frame has wrong dimensions: ");
        Serial.println(frame.size());
        return;
    }

    // ✅ Copy frame data into `frameBuffer`
    for (size_t i = 0; i < 16 * 16; i++) {
        const char* color = frame[i].as<const char*>();
        current_animation.frameBuffer[i] = strtol(color + 1, NULL, 16);  // Convert "#RRGGBB" to CRGB
    }

    Serial.print("Successfully loaded frame ");
    Serial.println(frameIndex);
}




void buttonToggled() {
  if (millis() - lastDebounceTime > debounce) {
    lastDebounceTime = millis();
    File selectedFile =  gallery.openNextFile();
    if (! selectedFile) {
      gallery.rewindDirectory();
      selectedFile = gallery.openNextFile();
    }
    Serial.print(F("Selected file: "));
    Serial.println(selectedFile.name());

    loadAnimation(selectedFile);
  }
}
void loadAnimation(File file) {

  if (current_animation.file) {
    current_animation.file.close();
  }
  //Animation animation;

  StaticJsonDocument<128> filter;
  filter["id"] = true;
  filter["timing"] = true;
  filter["frame_amount"] = true;

  StaticJsonDocument<1024> metadata;
  Serial.println(F("Deserializing metadata"));
  DeserializationError error = deserializeJson(metadata, file, DeserializationOption::Filter(filter));

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }
  Serial.println(F("Animation File deserialized, baking animation"));

  current_animation.id = metadata["id"];
  current_animation.timing = metadata["timing"];
  current_animation.frame_amount = metadata["frame_amount"];
  current_animation.file = file;  // Keep reference to the open file for dynamic frame loading

  Serial.print("Loaded metadata for animation with ");
  Serial.print(current_animation.frame_amount);
  Serial.println(" frames.");

  current_animation.currentFrameIndex = 0;
  Serial.println("Loading frame:");
  loadFrame(0);

  Serial.println("Finished creatring animation");
  return;
}

void loop() {
  drawAnimation(current_animation);

  WiFiClient client = server.available();
  if (client) {
    Serial.println(F("request detected"));
    if (client.available()) {
      Request request = parseRequest(client);
      handleRequest(request, client);
    }
    delay(1); // Slow WiFi safety delay >.<
    client.stop();
    Serial.println(F("request closed"));
  }
}

void sendError(int errorCode, WiFiClient client) {
  client.print("HTTP/1.1 ");
  client.println(errorCode);
}

void saveFile(Request request, WiFiClient client) {
  JsonDocument filter;
  filter["id"] = true;
  JsonDocument doc;

  DeserializationError error = deserializeJson(doc, request.body, DeserializationOption::Filter(filter));

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    sendError(400, client);
    return;
  }

  int id = doc["id"];
  String path = String("/gallery/");
  path.concat(id);
  SD.remove(path.c_str());
  File dataFile = SD.open(path.c_str(), FILE_WRITE);
  if(dataFile) {
    dataFile.println(request.body);

    printHeader(client, 200, F("OK"), "");
  } else {
    sendError(500, client);
  }
  dataFile.close();
}

void printHeader(WiFiClient client, int code, String status, String type) {
  client.print(F("HTTP/1.1 "));
  client.print(code);
  client.println(" " + status);
  client.println(F("Access-Control-Allow-Origin: *"));
  if(type.length() > 0) {
    client.print(F("Content-type: "));
    client.println(type);
  }
  client.println();
}

void lsGallery(Request request, WiFiClient client) {
  File dir = SD.open(F("/gallery"));
  JsonDocument doc;

  printHeader(client, 200, F("OK"), F("application/json"));

  JsonArray files = doc["files"].add<JsonArray>();

  while(true) {
    File entry =  dir.openNextFile();
    if (! entry) {
      break;
    }
    files.add(String(entry.name()));
  }
  doc.shrinkToFit();
  String json;
  serializeJson(doc, json);
  client.println(json);
}

void deleteFile(Request request, WiFiClient client) {
  String path = "/gallery/";
  path.concat(request.body);
  SD.remove(path);
}

void serveFile(Request request, WiFiClient client) {
  String dataType = "text/plain";
  if (request.path.endsWith(".htm") || request.path.endsWith(".html")) {
    dataType = "text/html";
  } else if (request.path.endsWith(".css")) {
    dataType = "text/css";
  } else if (request.path.endsWith(".js") || request.path.endsWith(".mjs")) {
    dataType = "application/javascript";
  } else if (request.path.endsWith(".png")) {
    dataType = "image/png";
  } else if (request.path.endsWith(".gif")) {
    dataType = "image/gif";
  } else if (request.path.endsWith(".jpg")) {
    dataType = "image/jpeg";
  }

  File dataFile = SD.open(request.path.c_str());
  if (dataFile.isDirectory()) {
    request.path += "/index.htm";
    dataType = "text/html";
    dataFile.close();
    dataFile = SD.open(request.path.c_str());
  }

  if (!dataFile) {
    sendError(404, client);
    dataFile.close();
    return;
  }

  if (request.query.indexOf("download") > 0) {
    dataType = "application/octet-stream";
  }

  printHeader(client, 200, F("OK"), dataType);

  while (dataFile.available()) {
    client.write(dataFile.read());
  }

  dataFile.close();
}

void handleRequest(Request request, WiFiClient client) {
  if (request.path == "/save") {
    saveFile(request, client);
    return;
  } else if (request.path == "/list") {
    lsGallery(request, client);
    return;
  } else if (request.path == "/delete") {
    // TODO handle delete
    return;
  }
  serveFile(request, client);
}

Request parseRequest(WiFiClient client) {
  Request request;
  String req = client.readStringUntil('\r');
  client.readStringUntil('\n');

  // Parse Path
  int addr_start = req.indexOf(' ');
  int addr_end = req.indexOf(' ', addr_start + 1);
  if (addr_start == -1 || addr_end == -1)
  {
    return request;
  }

  String url = req.substring(addr_start + 1, addr_end);
  String query = "";
  int hasQuery = url.indexOf('?');

  if (hasQuery != -1)
  {
    query = url.substring(hasQuery + 1);
    url = url.substring(0, hasQuery);
  }

  size_t content_length = get_content_length(client);
  Serial.print(F("Detected Content-Length: "));
  Serial.println(content_length);

  String bodyBuf;
  while (bodyBuf.length() < content_length)
  {
    int tries = 100000; // 100s
    size_t avail;

    while (!(avail = client.available()) && tries--) {
      Serial.println(F("No data available, waiting 1ms"));
      delay(1);
    }
    if (!avail) {
      Serial.println(F("Timeout reached"));
      break;
    }

    if (bodyBuf.length() + avail > content_length) {
      avail = content_length - bodyBuf.length();
    }


    while (avail--) {
      bodyBuf += (char)client.read();
    }
  }

  request.path = url;
  request.query = query;
  request.body = bodyBuf;

  return request;
}

int get_content_length(WiFiClient client) {
  int content_length = 0;
  while (1)
  {
    String req = client.readStringUntil('\r');
    client.readStringUntil('\n');

    if (req == "")
      break;//no more headers

    int headerDiv = req.indexOf(':');

    if (headerDiv == -1)
      break;//no valid header

    String headerName = req.substring(0, headerDiv);
    String headerValue = req.substring(headerDiv + 1);

    headerValue.trim();

    if (headerName.equalsIgnoreCase("Content-Length")) {
      content_length = headerValue.toInt();
    }
  }
  return content_length;
}

void printWifiStatus() {
  IPAddress ip = WiFi.localIP();
  long rssi = WiFi.RSSI();
  Serial.print(F("IP Address: "));
  Serial.println(ip);
  Serial.print(F("signal strength (RSSI):"));
  Serial.print(rssi);
  Serial.println(F(" dBm"));
  Serial.print(F("To see this page in action, open a browser to http://"));
  Serial.println(ip);
}
