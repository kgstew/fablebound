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

enum LegPosition
{
  BOW_STARBOARD,
  BOW_PORT,
  STERN_STARBOARD,
  STERN_PORT,
  UNKNOWN_POSITION
};

LegPosition getLegPositions(const std::string &legPosition)
{
  if (legPosition == "bowStarboard")
  {
    return BOW_STARBOARD;
  }
  else if (legPosition == "bowPort")
  {
    return BOW_PORT;
  }
  else if (legPosition == "sternStarboard")
  {
    return STERN_STARBOARD;
  }
  else if (legPosition == "sternPort")
  {
    return STERN_PORT;
  }
  else
  {
    return UNKNOWN_POSITION;
  }
}

enum ValveType
{
  BALLAST_INTAKE_VALVE,
  BALLAST_TO_PISTON_VALVE,
  PISTON_RELEASE_VALVE,
  UNKNOWN_VALVE
};

ValveType getValveType(const std::string &valveName)
{
  if (valveName == "ballastIntakeValve")
  {
    return BALLAST_INTAKE_VALVE;
  }
  else if (valveName == "ballastToPistonValve")
  {
    return BALLAST_TO_PISTON_VALVE;
  }
  else if (valveName == "pistonReleaseValve")
  {
    return PISTON_RELEASE_VALVE;
  }
  else
  {
    return UNKNOWN_VALVE;
  }
}

void updateLeg(Leg *leg, json leg_state)
{
  if (leg == nullptr)
  {
    Serial.println("Error: leg pointer is null");
    return;
  }

  Serial.println("Updating Leg: ");
  Serial.printf("leg %p\n", leg);
  auto output = leg_state.dump();
  Serial.println(output.c_str());

  // List of valves to check
  std::vector<std::string> valves = {"ballastIntakeValve", "ballastToPistonValve", "pistonReleaseValve"};

  for (const auto &valveName : valves)
  {
    if (leg_state.contains(valveName))
    {
      ValveType valveType = getValveType(valveName);
      bool open = leg_state[valveName] == "open";

      switch (valveType)
      {
      case BALLAST_INTAKE_VALVE:
        Serial.printf("%s ballastIntakeValve\n", open ? "Opening" : "Closing");
        leg->setSolenoidState(Solenoid::SolenoidPosition::ballast, open);
        break;

      case BALLAST_TO_PISTON_VALVE:
        Serial.printf("%s ballastToPistonValve\n", open ? "Opening" : "Closing");
        leg->setSolenoidState(Solenoid::SolenoidPosition::piston, open);
        break;

      case PISTON_RELEASE_VALVE:
        Serial.printf("%s pistonReleaseValve\n", open ? "Opening" : "Closing");
        leg->setSolenoidState(Solenoid::SolenoidPosition::vent, open);
        break;

      case UNKNOWN_VALVE:
      default:
        Serial.printf("Unknown valve: %s\n", valveName.c_str());
        break;
      }
    }
    else
    {
      Serial.printf("Error: '%s' key is missing in leg_state\n", valveName.c_str());
    }
  }
}

void findLegsToUpdate(json desired_state)
{
  // List of valves to check
  std::vector<std::string> positions = {"bowStarboard", "bowPort", "sternStarboard", "sternPort"};

  for (const auto &position : positions)
  {
    if (desired_state.contains(position))
    {
      LegPosition legPosition = getLegPositions(position);

      switch (legPosition)
      {
      case BOW_PORT:
        Serial.printf("%s updating \n", position.c_str());
        updateLeg(LegStarboardBow, desired_state[position]);
        break;

      case BOW_STARBOARD:
        Serial.printf("%s updating \n", position.c_str());
        updateLeg(LegStarboardBow, desired_state[position]);
        break;

      case STERN_PORT:
        Serial.printf("%s updating \n", position.c_str());
        updateLeg(LegPortStern, desired_state[position]);
        break;

      case STERN_STARBOARD:
        Serial.printf("%s updating \n", position.c_str());
        updateLeg(LegStarboardStern, desired_state[position]);
        break;
      default:
        Serial.printf("Unknown position: %s\n", position.c_str());
        break;
      }
    }
    else
    {
      Serial.printf("Error: '%s' key is missing in desired_state\n", position.c_str());
    }
  }
};

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
    break;
  case WStype_TEXT:
    Serial.printf("Received text: %s\n", payload);
    desired_state = json::parse(payload);
    findLegsToUpdate(desired_state);
    break;
  case WStype_BIN:
    Serial.println("Received binary data");
    Serial.println("Toggling TESTSOLENOID / LED ");
    digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
    digitalWrite(LED, !digitalRead(LED));
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
  LegStarboardBow = new Leg("StarboardBow");
  LegPortStern = new Leg("PortStern");
  LegPortBow = new Leg("PortBow");
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

  // Serial.println(LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::ballast));
  // system_state["sternStarboard"]["pistonPressurePsi"] = LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::piston);
}