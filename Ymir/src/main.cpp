#include <WiFi.h>
#include <WebSocketsClient.h>
// #include "index.h"

#include <ControlCode/json.hpp>
// for convenience
using json = nlohmann::json;

#include "ControlCode/Leg.h"

#ifdef ARDUINO
#include <Arduino.h>
#else
#include "MockArduino/MockArduino.h"
#endif

#define LED 2
#define TESTSOLENOID 15

// Init 4 leg objects
Leg *LegStarboardStern = NULL;
Leg *LegPortStern = NULL;
Leg *LegStarboardBow = NULL;
Leg *LegPortBow = NULL;

// init Json data object
json system_state = {
    {"type", "espToServerSystemState"},
    {"sendTime", "notime"},
    {"bigAssMainTank", {{"pressurePsi", 0}, {"compressorToTankValve", "closed"}}},
    {"bowStarboard", {{"ballastPressurePsi", 0}, {"pistonPressurePsi", 0}, {"ballastIntakeValve", "closed"}, {"ballastToPistonValve", "closed"}, {"pistonReleaseValve", "closed"}}},
    {"bowPort", {{"ballastPressurePsi", 0}, {"pistonPressurePsi", 0}, {"ballastIntakeValve", "closed"}, {"ballastToPistonValve", "closed"}, {"pistonReleaseValve", "closed"}}},
    {"sternPort", {{"ballastPressurePsi", 0}, {"pistonPressurePsi", 0}, {"ballastIntakeValve", "closed"}, {"ballastToPistonValve", "closed"}, {"pistonReleaseValve", "closed"}}},
    {"sternStarboard", {{"ballastPressurePsi", 0}, {"pistonPressurePsi", 0}, {"ballastIntakeValve", "closed"}, {"ballastToPistonValve", "closed"}, {"pistonReleaseValve", "closed"}}}};

// Replace with your network credentials
const char *ssid = "Whitesands";
const char *password = "alllowercasenocaps";

// WebSocket server address and port
const char *websocket_server = "192.168.0.14";
const uint16_t websocket_port = 8079;

// Create a WebSocket client instance
WebSocketsClient webSocket;

void updateLeg(Leg *leg, json desired_state)
{
  if (leg == nullptr)
  {
    Serial.println("Error: leg pointer is null");
    return;
  }

  Serial.println("Updating Leg: ");
  Serial.printf("leg %p\n", leg);
  auto output = desired_state.dump();
  Serial.println(output.c_str());

  switch (desired_state)
  {
  case Solenoid::SolenoidPosition::ballast:
    ballastSolenoid.setState(state);
    break;

  case Solenoid::SolenoidPosition::piston:
    pistonSolenoid.setState(state);
    break;

  case Solenoid::SolenoidPosition::vent:
    ventSolenoid.setState(state);
    break;
  }
}

// Check for the existence of the keys before accessing them
if (desired_state.contains("ballastToPistonValve"))
{
  if (desired_state["ballastToPistonValve"] == "open")
  {
    Serial.print("Opening ballastToPistonValve");
    leg->setSolenoidState(Solenoid::SolenoidPosition::piston, true);
  }
  else
  {
    leg->setSolenoidState(Solenoid::SolenoidPosition::piston, false);
    Serial.println("Closing ballastToPistonValve");
  }
}
else
{
  Serial.println("Error: 'ballastToPistonValve' key is missing in desired_state");
}

if (desired_state.contains("ballastIntakeValve"))
{
  if (desired_state["ballastIntakeValve"] == "open")
  {
    leg->setSolenoidState(Solenoid::SolenoidPosition::ballast, true);
    Serial.println("Opening ballastIntakeValve");
  }
  else
  {
    leg->setSolenoidState(Solenoid::SolenoidPosition::ballast, false);
    Serial.println("Closing ballastIntakeValve");
  }
}
else
{
  Serial.println("Error: 'ballastIntakeValve' key is missing in desired_state");
}

if (desired_state.contains("pistonReleaseValve"))
{
  if (desired_state["pistonReleaseValve"] == "open")
  {
    leg->setSolenoidState(Solenoid::SolenoidPosition::vent, true);
    Serial.print("Opening pistonReleaseValve");
  }
  else
  {
    leg->setSolenoidState(Solenoid::SolenoidPosition::vent, false);
    Serial.print("Closing pistonReleaseValve");
  }
}
else
{
  Serial.println("Error: 'pistonReleaseValve' key is missing in desired_state");
}
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  json desired_state;
  std::string s;
  // system_state["sternStarboard"]["ballastPressurePsi"] = LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::ballast);
  // system_state["sternStarboard"]["pistonPressurePsi"] = LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::piston);

  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.println("Disconnected from WebSocket server");
    break;
  case WStype_CONNECTED:

    Serial.println("Connected to WebSocket server");
    s = system_state.dump();
    webSocket.sendTXT(s.c_str(), s.length());
    Serial.println("Sent JSON to WebSocket server");
    // webSocket.sendTXT("hello world");
    break;
  case WStype_TEXT:
    // When the websocket client sends a Hello from ESP32 message,
    // toggle the Blue LED(Pin2) and TESTSOLENOID(Pin15) pins ,
    // wait 5 seconds and then toggle them back.
    Serial.printf("Received text: %s\n", payload);

    // Serial.println("Toggling TESTSOLENOID / LED ");
    // digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
    // digitalWrite(LED, !digitalRead(LED));
    // Serial.println("Toggling TESTSOLENOID / LED back in 5 seconds");
    // delay(1000);
    // Serial.println("Toggling TESTSOLENOID / LED back in 4 seconds");
    // delay(1000);
    // Serial.println("Toggling TESTSOLENOID / LED back in 3 seconds");
    // delay(1000);
    // Serial.println("Toggling TESTSOLENOID / LED back in 2 seconds");
    // delay(1000);
    // Serial.println("Toggling TESTSOLENOID / LED back in 1 seconds");
    // delay(1000);
    // Serial.println("Toggling TESTSOLENOID / LED back");
    // digitalWrite(LED, !digitalRead(LED));
    // digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
    desired_state = json::parse(payload);
    updateLeg(LegStarboardStern, desired_state["sternStarboard"]);
    break;
  case WStype_BIN:
    Serial.println("Received binary data");
    Serial.println("Toggling TESTSOLENOID / LED ");
    digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
    digitalWrite(LED, !digitalRead(LED));
    Serial.println("Toggling TESTSOLENOID / LED back in 5 seconds");
    delay(1000);
    Serial.println("Toggling TESTSOLENOID / LED back in 4 seconds");
    delay(1000);
    Serial.println("Toggling TESTSOLENOID / LED back in 3 seconds");
    delay(1000);
    Serial.println("Toggling TESTSOLENOID / LED back in 2 seconds");
    delay(1000);
    Serial.println("Toggling TESTSOLENOID / LED back in 1 seconds");
    delay(1000);
    Serial.println("Toggling TESTSOLENOID / LED back");
    digitalWrite(LED, !digitalRead(LED));
    digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
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
  delay(1000);
  pinMode(LED, OUTPUT);
  pinMode(TESTSOLENOID, OUTPUT);
  digitalWrite(TESTSOLENOID, LOW);
  LegStarboardStern = new Leg("StarboardStern");
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

// {
//   // When filling the BallastSolenoid of a Leg, the pistonSolenoid must be closed
//   if (leg->isSolenoidOpen(Solenoid::SolenoidPosition::ballast) && leg->isSolenoidOpen(Solenoid::SolenoidPosition::piston))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::piston);
//   }

//   // When filling the JackSolenoid of a Leg, the VentSolenoid must be closed
//   if (leg->isSolenoidOpen(Solenoid::SolenoidPosition::piston) && leg->isSolenoidOpen(Solenoid::SolenoidPosition::vent))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::vent);
//   }

//   // If the Jack pressure exceeds 150 psi, the JackSolenoid is closed and the VentSolenoid opens until the pressure is less than 100 PSI
//   if (leg->getPressureSensorReading(PressureSensor::PressurePosition::piston) > 150)
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::piston);
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::vent);
//     while (leg->getPressureSensorReading(PressureSensor::PressurePosition::piston) > 100)
//     {
//       // Wait until the pressure is less than 100 PSI
//     }
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::vent);
//   }

//   // If the JackSolenoid is closed and the pressure in the Ballast is less than 90 psi, the ballast solenoid opens
//   if (!leg->isSolenoidOpen(Solenoid::SolenoidPosition::piston) && (leg->getPressureSensorReading(PressureSensor::PressurePosition::ballast) < 90))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::ballast);
//   }

//   // The VentSolenoid is closed and will not open if the pistonPressure is <= 30 PSI
//   if ((leg->getPressureSensorReading(PressureSensor::PressurePosition::piston) <= 30) && leg->isSolenoidOpen(Solenoid::SolenoidPosition::vent))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::vent);
//   }

//   // Add any additional control code logic here
// }

void loop()
{
  // Run the WebSocket client
  webSocket.loop();

  // updateLeg(LegStarboardStern, desired_state["sternStarboard"]);
  // updateLeg(LegPortStern, desired_state["sternPort"]);
  // updateLeg(LegStarboardBow, desired_state["bowStarboard"]);
  // updateLeg(LegPortBow, desired_state["bowPort"]);

  // Serial.println(LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::ballast));
  //  system_state["sternStarboard"]["pistonPressurePsi"] = LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::piston);
  //  webSocket.sendTXT("{\"type\":\"greeting\", \"msg\":\"Hello from ESP32\"}");
  //  {
  //    // Perform the necessary control code logic here

  //   // Switch Case for the Solenoid Position based on incoming json

  //   // Sleep for a certain period of time before running the loop again
  // }
}