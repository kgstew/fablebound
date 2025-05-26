#include <Ticker.h>
#include <WebSocketsClient.h>
#include <WiFi.h>
#include <atomic>
// #include "index.h"

#include <ControlCode/json.hpp>
// for convenience
using json = nlohmann::json;

#include "ControlCode/Leg.h"
#include <Arduino.h>

#define LED 5
#define TESTSOLENOID 15
#define USE_WIFI

// UNCOMMENT THIS FOR BOW
// #define BOW
// UNCOMMENT THIS FOR STERN
#define STERN

#ifdef BOW
constexpr uint16_t websocket_port = 8071;
static const std::string messageType = "espToServerSystemStateBow";
#endif

#ifdef STERN
constexpr uint16_t websocket_port = 8072;
static const std::string messageType = "espToServerSystemStateStern";
#endif

constexpr double SEND_STATE_DELTA = 0.2; // seconds

constexpr double PROCESS_SENSORS_RATE = 100.0; // Hz
constexpr double PROCESS_SENSORS_DELTA = 1.0 / PROCESS_SENSORS_RATE; // seconds

// Replace with your network credentials
static const char* ssid = "VikingRadio";
static const char* password = "vikinglongship";

// WebSocket server address and port
static const char* websocketServer = "192.168.0.101";

constexpr int portTriggerPin = 16; // yellow
constexpr int portEchoPin = 36; // white

Leg* legStarboard = nullptr;
Leg* legPort = nullptr;

static std::atomic<bool> shouldSendState { false };

// Create a WebSocket client instance
WebSocketsClient webSocket;

Ticker sendStateTicker;
Ticker processSensorsTicker;

void sendState()
{
    json systemState = { // clang-format off
        { "type", messageType }, 
        { "sendTime", "notime" },
        { "bigAssMainTank", { { "pressurePsi", 0 }, 
                            { "compressorToTankValve", "closed" } } },
        { legStarboard->getPositionAsString(), legStarboard->getLastStateAsJson() },
        { legPort->getPositionAsString(), legPort->getLastStateAsJson() } 
    }; // clang-format on

    std::string s = systemState.dump();
    webSocket.sendTXT(s.c_str(), s.length());
}

void processStateRequest(json& requestedState)
{
    // update each leg
    for (auto& leg : { legStarboard, legPort }) {
        auto legPositionString = leg->getPositionAsString();

        if (requestedState.contains(legPositionString)) {
            // update solenoid states
            for (auto& solenoidRef : leg->getSolenoids()) {
                auto& solenoid = solenoidRef.get();
                auto solenoidPositionString = solenoid.getPositionAsString();

                if (requestedState.contains(solenoidPositionString)) {
                    solenoid.setState(requestedState[solenoidPositionString]);
                } else {
                    Serial.printf("Unknown solenoid position: %s\n", solenoidPositionString.c_str());
                }
            }
        } else {
            Serial.printf("Unknown leg position: %s\n", legPositionString.c_str());
        }
    }
}

void getSensorReadings()
{
    // update readings
    for (auto& leg : { legStarboard, legPort }) {
        for (auto& pressureSensorRef : leg->getPressureSensors()) {
            auto& pressureSensor = pressureSensorRef.get();
            auto pressure = pressureSensor.getReading();
        }
        for (auto& distanceSensorRef : leg->getDistanceSensors()) {
            auto& distanceSensor = distanceSensorRef.get();
            auto distance = distanceSensor.getReading();
        }
    }
}

void onSendStateJsonTicker()
{
    if (shouldSendState)
        sendState();
}

void onProcessSensorsTicker()
{
    getSensorReadings();

    // TODO: process average distance and average error from target distance
}

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length)
{
    std::string s;

    switch (type) {
    case WStype_DISCONNECTED: {
        Serial.println("Disconnected from WebSocket server");
        shouldSendState = false;
        break;
    }
    case WStype_CONNECTED: {
        Serial.println("Connected to WebSocket server");
        shouldSendState = true;
        break;
    }
    case WStype_TEXT: {
        Serial.printf("Received text: %s\n", payload);
        auto requestedState = json::parse(payload);
        processStateRequest(requestedState);
        break;
    }
    case WStype_BIN: {
        Serial.println("Received binary data");
        Serial.println("Toggling TESTSOLENOID / LED ");

        digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
        digitalWrite(LED, !digitalRead(LED));
        digitalWrite(LED, !digitalRead(LED));
        digitalWrite(TESTSOLENOID, !digitalRead(TESTSOLENOID));
        break;
    }
    case WStype_PING: {
        Serial.println("Received ping");
        break;
    }
    case WStype_PONG: {
        Serial.println("Received pong");
        break;
    }
    case WStype_ERROR: {
        Serial.println("Error occurred");
        break;
    }
    default: {
        Serial.println("Unknown event");
    }
    }
}

void setup()
{
    Serial.begin(115200);
    delay(1000);

    legStarboard = new Leg(Leg::Position::starboard,
        21, // ballast fill pin
        22, // piston fill pin
        23, // vent pin
        34, // ballast pressure sensor pin
        35, // piston pressure sensor pin
        16, // Change to 1
        36 // Change to 39
    );
    legPort = new Leg(Leg::Position::port,
        17, // ballast fill pin
        18, // piston fill pin
        19, // vent pin
        32, // ballast pressure sensor pin
        33, // piston pressure sensor pin
        16, // ultrasonic trigger pin
        36 // ultrasonic echo pin
    );

    getSensorReadings(); // get initial sensor readings
    processSensorsTicker.attach(PROCESS_SENSORS_DELTA, onProcessSensorsTicker);
#ifdef USE_WIFI
    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");

    // Set up WebSocket client
    webSocket.begin(websocketServer, websocket_port, "/");
    webSocket.onEvent(onWebSocketEvent);

    sendStateTicker.attach(SEND_STATE_DELTA, onSendStateJsonTicker);
#endif // USE_WIFI

}

void loop()
{
// Run the WebSocket client
#ifdef USE_WIFI
    webSocket.loop();
#endif // USE_WIFI
}