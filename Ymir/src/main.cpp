#include <Ticker.h>
#include <WebSocketsClient.h>
#include <WiFi.h>
// #include "index.h"

#include <ControlCode/json.hpp>
// for convenience
using json = nlohmann::json;

#include "ControlCode/DataInterfaceUtils.h"
#include "ControlCode/Leg.h"
#include <Arduino.h>

#define LED 5
#define TESTSOLENOID 15
// #define USE_WIFI

Leg* LegStarboard = nullptr;
Leg* LegPort = nullptr;

const int porttrigPin = 16; // yellow
const int portechoPin = 36; // white

// Replace with your network credentials
const char* ssid = "VikingRadio";
const char* password = "vikinglongship";

// WebSocket server address and port
const char* websocket_server = "0.0.0.0";

// Websocket server port
// CHANGE THIS TO CHANGE BOW VS STERN
// BOW: 8071 and espToServerSystemStateBow
// STERN: 8072 and espToServerSystemStateStern

// UNCOMMENT THIS FOR BOW
// const uint16_t websocket_port = 8071;
// const char* messageType = "espToServerSystemStateBow";

// UNCOMMENT THIS FOR STERN
const uint16_t websocket_port = 8072;
const char* messageType = "espToServerSystemStateStern";

// init Json data object
json system_state = { { "type", messageType }, { "sendTime", "notime" },
    { "starboard",
        { { "ballastPressurePsi", 0 }, { "pistonPressurePsi", 0 }, { "ballastIntakeValve", "closed" },
            { "ballastToPistonValve", "closed" }, { "pistonReleaseValve", "closed" } } },
    { "port",
        { { "ballastPressurePsi", 0 }, { "pistonPressurePsi", 0 }, { "ballastIntakeValve", "closed" },
            { "ballastToPistonValve", "closed" }, { "pistonReleaseValve", "closed" } } } };

// Create a WebSocket client instance
WebSocketsClient webSocket;
Ticker updateTicker;

void sendStateJson()
{
    auto stateJson = getStateJson(messageType);
    std::string s = stateJson.dump();
    webSocket.sendTXT(s.c_str(), s.length());
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length)
{
    json desired_state;
    std::string s;
    // system_state["sternStarboard"]["ballastPressurePsi"] =
    // LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::ballast);
    // system_state["sternStarboard"]["pistonPressurePsi"] =
    // LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::piston);

    switch (type) {
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

    LegStarboard = new Leg("Starboard",
        21, // ballast fill pin
        22, // piston fill pin
        23, // vent pin
        34, // ballast pressure sensor pin
        35, // piston pressure sensor pin
        16, // Change to 1
        36 // Change to 39
    );
    LegPort = new Leg("Port",
        17, // ballast fill pin
        18, // piston fill pin
        19, // vent pin
        32, // ballast pressure sensor pin
        33, // piston pressure sensor pin
        16, // ultrasonic trigger pin
        36 // ultrasonic echo pin
    );
#ifdef USE_WIFI

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");

    // // Set up WebSocket client
    webSocket.begin(websocket_server, websocket_port, "/");
    webSocket.onEvent(webSocketEvent);
    updateTicker.attach(.2, sendStateJson);
#endif // USE_WIFI
}

// {
//   // When filling the BallastSolenoid of a Leg, the pistonSolenoid must be closed
//   if (leg->isSolenoidOpen(Solenoid::SolenoidPosition::ballast) &&
//   leg->isSolenoidOpen(Solenoid::SolenoidPosition::piston))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::piston);
//   }

//   // When filling the JackSolenoid of a Leg, the VentSolenoid must be closed
//   if (leg->isSolenoidOpen(Solenoid::SolenoidPosition::piston) &&
//   leg->isSolenoidOpen(Solenoid::SolenoidPosition::vent))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::vent);
//   }

//   // If the Jack pressure exceeds 150 psi, the JackSolenoid is closed and the VentSolenoid opens until the pressure
//   is less than 100 PSI if (leg->getPressureSensorReading(PressureSensor::PressurePosition::piston) > 150)
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
//   if (!leg->isSolenoidOpen(Solenoid::SolenoidPosition::piston) &&
//   (leg->getPressureSensorReading(PressureSensor::PressurePosition::ballast) < 90))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::ballast);
//   }

//   // The VentSolenoid is closed and will not open if the pistonPressure is <= 30 PSI
//   if ((leg->getPressureSensorReading(PressureSensor::PressurePosition::piston) <= 30) &&
//   leg->isSolenoidOpen(Solenoid::SolenoidPosition::vent))
//   {
//     leg->toggleSolenoid(Solenoid::SolenoidPosition::vent);
//   }

//   // Add any additional control code logic here
// }

void loop()
{
// Run the WebSocket client
#ifdef USE_WIFI
    webSocket.loop();
#endif // USE_WIFI

    // Serial.println(LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::ballast));
    // system_state["sternStarboard"]["pistonPressurePsi"] =
    // LegStarboardStern->getPressureSensorReading(PressureSensor::PressurePosition::piston);
    LegPort->getDistanceSensorReading();
}