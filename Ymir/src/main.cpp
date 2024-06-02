#include <WiFi.h>
#include <WebSocketsClient.h>
#include "index.h"
#include "ControlCode/Leg.h"
#ifdef ARDUINO
#include <Arduino.h>
#else
#include "MockArduino/MockArduino.h"
#endif
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <thread>

#define LED 2

Leg *LegStarboardAft = NULL;
Leg *LegPortAft = NULL;
Leg *LegStarboardBow = NULL;
Leg *LegPortBow = NULL;

class YmirPneumaticsControl {
private:
    // Enum for leg components , not sure if this is needed or handled by the Leg.cpp
    enum LegComponent {
        BallastSolenoid,
        BallastPressureSensor,
        JackSolenoid,
        JackPressureSensor,
        VentSolenoid
    };

    // Struct to hold pressure readings for each leg component, TODO : modify to also store soleinoid state
    struct PressureReading {
        double pressure; // Pressure in psi
        std::chrono::system_clock::time_point timestamp;
    };

    // Map to store pressure readings for each leg component, TODO : modify to also store soleinoid state
    std::vector<std::pair<LegComponent, PressureReading>> pressureReadings;

    // Websocket connection to Yggdrasil
    //
    //
    //

public:
    // Constructor
    YmirPneumaticsControl() {
        // Initialize pressure readings for each leg component
        for (int i = 0; i < 5; ++i) {
            pressureReadings.push_back(std::make_pair(static_cast<LegComponent>(i), PressureReading{0.0, std::chrono::system_clock::now()}));
        }
    }

    // Destructor
    ~YmirPneumaticsControl() {
        // Cleanup code if necessary
    }

    // Method to establish websocket connection to Yggdrasil
    void connectToYggdrasil() {
        // Implement websocket connection logic here
        std::cout << "Connecting to Yggdrasil..." << std::endl;
        // Placeholder for connection logic
        //
        // see socket_server.cpp for websocket server connection logic
        // see socket_client.cpp for websocket client connection logic
        //
        //

        std::this_thread::sleep_for(std::chrono::seconds(1));
        std::cout << "Connected to Yggdrasil." << std::endl;
    }

    // Method to continuously retry connecting to Yggdrasil
    void retryConnecting() {
        while (true) {
            connectToYggdrasil();
            // Retry logic here
            std::this_thread::sleep_for(std::chrono::seconds(5));
        }
    }

    // Method to receive pressure readings from Yggdrasil
    void receivePressureReadings() {
        // Placeholder for receiving pressure readings
        // This method will be continuously running in a separate thread
        while (true) {
            // Placeholder for receiving pressure readings
            //
            // LegStarboardAft->getPressureSensorReading(PressureSensor::PressurePosition::ballast)
            // LegPortAft->getPressureSensorReading(PressureSensor::PressurePosition::ballast)
            // LegStarboardBow->getPressureSensorReading(PressureSensor::PressurePosition::ballast)
            // LegPortBow->getPressureSensorReading(PressureSensor::PressurePosition::ballast)

            // Update pressureReadings vector with received readings
            std::this_thread::sleep_for(std::chrono::milliseconds(250)); // Simulate receiving readings every 250ms
        }
    }

    // Method to control pneumatics based on pressure readings
    void controlPneumatics() {
        // Placeholder for pneumatics control logic
        // This method will be continuously running in a separate thread
        while (true) {
            // Placeholder for controlling pneumatics based on pressure readings
            // Implement the control logic described in the problem statement
            //
            // When filling the BallastSolenoid of a Leg the JackSolenoid must be closed
            // When filling the JackSolenoid of a Leg the VentSolenoid must be closed
            // If the Jack pressure exceeds 150 psi the JackSolenoid is closed and the VentSolenoid opens until the pressure is less than 100 PSI
            // If the JackSolenoid is closed and the pressure in the Ballast is less than 90 psi the ballast solenoid opens
            // The VentSolenoid is closed and will not open if the JackPressure is <= 30 PSI
            //
            // Pressure readings for each sensors are sent 4 times a second to Yggdrasil

            // Yggdrasil will send either : 
            //      1)  comands to move specific components 
            //      2)  An object repensenting the state of the system that this control loop 
            //          will attempt to atain subject to above constraints 

            std::this_thread::sleep_for(std::chrono::seconds(1)); // Run control logic every second
        }
    }
};

int main() {
    // Create an instance of the YmirPneumaticsControl class
    YmirPneumaticsControl pneumaticsControl;

    // Start websocket connection
    std::thread connectThread(&YmirPneumaticsControl::retryConnecting, &pneumaticsControl);

    // Start receiving pressure readings
    std::thread receiveThread(&YmirPneumaticsControl::receivePressureReadings, &pneumaticsControl);

    // Start controlling pneumatics
    std::thread controlThread(&YmirPneumaticsControl::controlPneumatics, &pneumaticsControl);

    // Join threads
    connectThread.join();
    receiveThread.join();
    controlThread.join();

    return 0;
}