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

struct Animation {
  int id;
  int frame_amount;
  int timing;
  JsonDocument data;
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
    current_animation = loadAnimation(selectedFile);
  } else {
    Serial.println(F("Please create the /gallery directory on the sd card"));
    while(true)
      ;
  }
  /////// END SD
}

void drawBitmap(JsonDocument animation, int index) {

  int row;
  int pixelIndex;

  FastLED.clear();

  for (int i = 0; i < NUM_LEDS; i += COLS) {  // i is the pixel index, incremented by the length of a row
    for (int j = 0; j < COLS; j++) {          // j is the column index, always traversed from 0 to COLS
      row = i / COLS;                               // row is the row index, ranging from 0 to 15
      pixelIndex = row % 2 == 0 ? j : COLS - j - 1; // pixelIndex is j translated depending on even/odd row

      const char *p = animation["data"][index][i + pixelIndex].as<const char*>();
      leds[i + pixelIndex] = strtol(p+1, NULL, 16); // p+1 to skip char '#' at index 0, strtol with base 16 to convert hex to long
    }
  }

  FastLED.show();
}

void drawAnimation(Animation animation) {
  int frame = floor(millis() / animation.timing);
  drawBitmap(animation.data, frame % animation.frame_amount);
}

void buttonToggled() {
  if (millis() - lastDebounceTime > debounce) {
    lastDebounceTime = millis();
    File selectedFile =  gallery.openNextFile();
    if (! selectedFile) {
      gallery.rewindDirectory();
      selectedFile = gallery.openNextFile();
    }

    current_animation = loadAnimation(selectedFile);
  }
}

Animation loadAnimation(File file) {
  Animation animation;

  JsonDocument filter;
  filter["data"] = true;
  filter["id"] = true;
  filter["timing"] = true;
  filter["frame_amount"] = 1;

  JsonDocument doc;

  Serial.println(F("Opening Animation File"));
  DeserializationError error = deserializeJson(doc, file, DeserializationOption::Filter(filter));

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return animation;
  }
  Serial.println(F("Animation File deserialized, baking animation"));

  int id = doc["id"];
  int timing = doc["timing"];
  JsonArray data = doc["data"];
  int frame_amount = doc["frame_amount"];

  animation.id = id;
  animation.timing = timing;
  animation.frame_amount = frame_amount;

  // Should not return JsonArray as it can point to dead mem.
  animation.data = doc;
  Serial.println("Finished creatring animation");
  return animation;
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
