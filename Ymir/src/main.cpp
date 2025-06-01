#include "ControlCode/Leg.h"
#include <Arduino.h>
#include <Ticker.h>
#include <WebSocketsClient.h>
#include <WiFi.h>
#include <atomic>
// #include "index.h"
#include <ControlCode/json.hpp>
// for convenience
using json = nlohmann::json;

// uncomment to enable debug print statements to the serial monitor
// #define DEBUG

#define USE_WIFI

// UNCOMMENT THIS FOR BOW
#define BOW
// UNCOMMENT THIS FOR STERN
// #define STERN

// debug macro
#ifdef DEBUG
#define DBG(x) x
#else
#define DBG(x)
#endif

// Replace with your network credentials
static const char* WIFI_SSID = "VikingRadio";
static const char* WIFI_PASSWORD = "vikinglongship";

// WebSocket server address and port
static const char* WEBSOCKET_SERVER = "192.168.0.101";

#ifdef BOW
constexpr uint16_t WEBSOCKET_PORT = 8071;
static const std::string MESSAGE_TYPE = "espToServerSystemStateBow";
#endif

#ifdef STERN
constexpr uint16_t WEBSOCKET_PORT = 8072;
static const std::string MESSAGE_TYPE = "espToServerSystemStateStern";
#endif

constexpr double PROCESS_SENSORS_RATE = 20.0; // Hz
constexpr double PROCESS_SENSORS_DELTA = 1.0 / PROCESS_SENSORS_RATE; // seconds

constexpr double SEND_STATE_RATE = 20.0; // Hz
constexpr double SEND_STATE_DELTA = 1.0 / SEND_STATE_RATE; // seconds

static bool shouldSendState { false };

// Create a WebSocket client instance
WebSocketsClient webSocket;

Ticker sendStateTicker;
Ticker processSensorsTicker;

Leg legStarboard {
    Leg::Position::starboard,
    21, // ballast fill pin
    22, // piston fill pin
    23, // vent pin
    34, // ballast pressure sensor pin
    35, // piston pressure sensor pin
    16, // ultrasonic trigger pin
    39 // ultrasonic echo pin
};

Leg legPort {
    Leg::Position::port,
    17, // ballast fill pin
    18, // piston fill pin
    19, // vent pin
    32, // ballast pressure sensor pin
    33, // piston pressure sensor pin
    5, // ultrasonic trigger pin
    36 // ultrasonic echo pin
};

void getSensorReadings()
{
    // update readings
    legPort.getPressureSensor(PressureSensor::Position::ballast).getReading();
    legPort.getPressureSensor(PressureSensor::Position::piston).getReading();
    legPort.getDistanceSensor().getReading();

    legStarboard.getPressureSensor(PressureSensor::Position::ballast).getReading();
    legStarboard.getPressureSensor(PressureSensor::Position::piston).getReading();
    legStarboard.getDistanceSensor().getReading();
}

void sendState()
{
    json systemState = { // clang-format off
        { "type", MESSAGE_TYPE }, 
        { "sendTime", "notime" },
        { "bigAssMainTank", { { "pressurePsi", 0 }, 
                            { "compressorToTankValve", "closed" } } },
        { legStarboard.getPositionAsString(), legStarboard.getLastStateAsJson() },
        { legPort.getPositionAsString(), legPort.getLastStateAsJson() } 
    }; // clang-format on

    std::string s = systemState.dump();
    DBG(Serial.println(s.c_str()));
#ifdef USE_WIFI
    webSocket.sendTXT(s.c_str(), s.length());
#endif
}

void processStateRequest(json& requestedState)
{
    // update each leg
    for (Leg* leg : { &legStarboard, &legPort }) {
        auto legPositionString = leg->getPositionAsString();

        if (requestedState.contains(legPositionString)) {
            // update solenoid states
            for (auto& solenoidRef : leg->getSolenoids()) {
                Solenoid& solenoid = solenoidRef.get();
                std::string solenoidPositionString = solenoid.getPositionAsString();

                if (requestedState.contains(solenoidPositionString)) {
                    solenoid.setState(requestedState[solenoidPositionString]);
                }
            }
        }
    }
}

void onSendStateTicker()
{
    if (shouldSendState)
        sendState();
}

void onProcessSensorsTicker()
{
    DBG(Serial.println("onProcessSensorsTicker"));
    getSensorReadings();

    // TODO: set pressure from distance

    // general idea:
    // - distance error = measured - target
    // - increase piston pressure while error > +threshold (i.e. distance < target)
    //   and the abs of the average error is decreasing
    // - decrease piston pressure if error < -threshold (i.e. distance > target)
    //   and the abs of the average error is decreasing

    // - instead of trying to reach a target distance, maybe find an overall pressure
    //   scale factor that minimizes the distance error instead
    // - will probably need to limit the duty cycle
}

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length)
{
    switch (type) {
    case WStype_DISCONNECTED: {
        DBG(Serial.println("Disconnected from WebSocket server"));
        shouldSendState = false;
        break;
    }
    case WStype_CONNECTED: {
        DBG(Serial.println("Connected to WebSocket server"));
        shouldSendState = true;
        break;
    }
    case WStype_TEXT: {
        DBG(Serial.printf("Received text: %s\n", payload));
        auto requestedState = json::parse(payload);
        processStateRequest(requestedState);
        break;
    }
    case WStype_BIN: {
        DBG(Serial.println("Received binary data"));
        break;
    }
    case WStype_PING: {
        DBG(Serial.println("Received ping"));
        break;
    }
    case WStype_PONG: {
        DBG(Serial.println("Received pong"));
        break;
    }
    case WStype_ERROR: {
        DBG(Serial.println("Error occurred"));
        break;
    }
    default: {
        DBG(Serial.println("Unknown event"));
        break;
    }
    }
}

void setup()
{
    Serial.begin(115200);
    delay(1000);

    legStarboard.setup();
    legPort.setup();

#ifdef BOW
    DBG(Serial.println("Configured as BOW"));
#endif

#ifdef STERN
    DBG(Serial.println("Configured as STERN"));
#endif

#ifdef USE_WIFI
    // Connect to Wi-Fi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        DBG(Serial.println("Connecting to WiFi..."));
    }
    DBG(Serial.println("Connected to WiFi"));

    // Set up WebSocket client
    webSocket.begin(WEBSOCKET_SERVER, WEBSOCKET_PORT, "/");
    webSocket.onEvent(onWebSocketEvent);
#else
    shouldSendState = true;
#endif // USE_WIFI

    processSensorsTicker.attach(PROCESS_SENSORS_DELTA, onProcessSensorsTicker);
    sendStateTicker.attach(SEND_STATE_DELTA, onSendStateTicker);
}

void loop()
{
// Run the WebSocket client
#ifdef USE_WIFI
    webSocket.loop();
#endif // USE_WIFI
}