#include <WiFi.h>
#include <WebSocketsClient.h>
// #include "index.h"
#include "ControlCode/Leg.h"
#ifdef ARDUINO
#include <Arduino.h>
#else
#include "MockArduino/MockArduino.h"
#endif

#define LED 2

// Replace with your network credentials
const char *ssid = "Whitesands";
const char *password = "alllowercasenocaps";

// WebSocket server address and port
const char *websocket_server = "192.168.0.38";
const uint16_t websocket_port = 8079;

// Create a WebSocket client instance
WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.println("Disconnected from WebSocket server");
    break;
  case WStype_CONNECTED:
    Serial.println("Connected to WebSocket server");
    webSocket.sendTXT("Hello from ESP32");
    break;
  case WStype_TEXT:
    Serial.printf("Received text: %s\n", payload);
    break;
  case WStype_BIN:
    Serial.println("Received binary data");
    break;
  case WStype_PING:
    Serial.println("Received ping");
    break;
  case WStype_PONG:
    Serial.println("Received pong");
    break;
  case WStype_ERROR:
    Serial.println("Error occurred");
    break;
  }
}

void setup()
{
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set up WebSocket client
  webSocket.begin(websocket_server, websocket_port, "/");
  webSocket.onEvent(webSocketEvent);
}

void loop()
{
  // Run the WebSocket client
  webSocket.loop();
}