/*********
  Rui Santos
  Complete instructions at https://RandomNerdTutorials.com/esp32-websocket-server-sensor/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*********/
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <WebSocketsServer.h>
#include "index.h"
#include "ControlCode/Leg.h"
#ifdef ARDUINO
#include <Arduino.h>
#else
#include "MockArduino/MockArduino.h"
#endif

#define LED 2

Leg *LegStarboardAft = NULL;
Leg *LegPortAft = NULL;
Leg *LegStarboardBow = NULL;
Leg *LegPortBow = NULL;

// Replace with your network credentials
const char *ssid = "Whitesands";
const char *password = "alllowercasenocaps";

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81); // WebSocket server on port 81

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.printf("[%u] Disconnected!\n", num);
    break;
  case WStype_CONNECTED:
  {
    IPAddress ip = webSocket.remoteIP(num);
    Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
  }
  break;
  case WStype_TEXT:
    Serial.printf("[%u] Received text: %s\n", num, payload);
    // Send a response back to the client

    digitalWrite(LED, !digitalRead(LED));
    LegStarboardAft->toggleSolenoid(Solenoid::SolenoidPosition::ballast);

    webSocket.sendTXT(num, "Received:  " + String((char *)payload));
    break;
  }
}

void setup()
{
  Serial.begin(115200);
  delay(1000);
  pinMode(LED, OUTPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Initialize WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  LegStarboardAft = new Leg("StarboardAft");
  LegPortAft = new Leg("PortAft");
  LegStarboardBow = new Leg("StarboardBow");
  LegPortBow = new Leg("PortBow");

  // Serve a basic HTML page with JavaScript to create the WebSocket connection
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    Serial.println("Web Server: received a web page request");
    String html = HTML_CONTENT;  // Use the HTML content from the index.h file
    request->send(200, "text/html", html); });

  server.begin();
  Serial.print("ESP32 Web Server's IP address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Leg Position");
  Serial.println(LegStarboardAft->getPosition().c_str());

  Serial.println(LegStarboardAft->getPressureSensorReading(PressureSensor::PressurePosition::ballast));
}

void loop()
{
  webSocket.loop();
}