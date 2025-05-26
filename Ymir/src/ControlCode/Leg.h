#pragma once
#include <Arduino.h>
#include <ControlCode/json.hpp>
#include <iostream>
#include <string>
#include <vector>

using json = nlohmann::json;

constexpr double SOUND_SPEED = 0.0343;
constexpr double CM_TO_INCH = 0.393701;

class DistanceSensor {
public:
    enum class Position { none }; // TODO: port/starboard?

    DistanceSensor(DistanceSensor::Position position, double reading, int triggerPin, int echoPin);
    double getReading();
    double getLastReading() const noexcept;
    int getTriggerPin() const noexcept;
    int getEchoPin() const noexcept;
    DistanceSensor::Position getPosition() const noexcept;
    std::string getPositionAsString() const;

private:
    const DistanceSensor::Position position;
    const int triggerPin;
    const int echoPin;
    double reading;
};

class PressureSensor {
public:
    enum class Position { ballast, piston };

    PressureSensor(PressureSensor::Position position, double reading, int pin);
    double getReading();
    double getLastReading() const noexcept;
    int getPin() const noexcept;
    PressureSensor::Position getPosition() const noexcept;
    std::string getPositionAsString() const;

private:
    const PressureSensor::Position position;
    const int pin;
    double reading;
};

class Solenoid {
public:
    enum class Position { ballast, piston, vent };

    Solenoid(Solenoid::Position position, bool open, int pin);
    bool isOpen();
    bool getState() const noexcept;
    void setState(bool state);
    void setState(std::string& state);
    int getPin() const noexcept;
    Solenoid::Position getPosition() const noexcept;
    std::string getPositionAsString() const;
    std::string getStateAsString() const;

private:
    const Solenoid::Position position;
    const int pin;
    bool open;
};

class Leg {
public:
    enum class Position { port, starboard };

    Leg(Leg::Position position, int ballastFillPin, int pistonFillPin, int ventPin, int ballastPressureSensorPin,
        int pistonPressureSensorPin, int distanceSensorTriggerPin, int distanceSensorEchoPin);

    Solenoid& getSolenoid(Solenoid::Position position);
    PressureSensor& getPressureSensor(PressureSensor::Position position);
    DistanceSensor& getDistanceSensor() noexcept;

    std::vector<std::reference_wrapper<Solenoid>> getSolenoids() noexcept;
    std::vector<std::reference_wrapper<PressureSensor>> getPressureSensors() noexcept;
    std::vector<std::reference_wrapper<DistanceSensor>> getDistanceSensors() noexcept;

    bool isSolenoidOpen(Solenoid::Position position);
    void setSolenoidState(Solenoid::Position position, bool state);

    double getPressureSensorReading(PressureSensor::Position position);
    double getDistanceSensorReading();

    Leg::Position getPosition() const noexcept;
    std::string getPositionAsString() const;

    json getStateAsJson();
    json getLastStateAsJson() const noexcept;

protected:
    Solenoid ballastSolenoid;
    Solenoid pistonSolenoid;
    Solenoid ventSolenoid;
    PressureSensor ballastPressureSensor;
    PressureSensor pistonPressureSensor;
    DistanceSensor distanceSensor;

    const Leg::Position position;
    double ballastPressure;
    double pistonPressure;
    double distance;

    const int ballastFillPin;
    const int pistonFillPin;
    const int ventPin;

    const int ballastPressureSensorPin;
    const int pistonPressureSensorPin;

    const int distanceSensorTriggerPin;
    const int distanceSensorEchoPin;

    // const double maxBallastPressure { 40.0 };
    // const double maxPistonPressure { 35.0 };
    // const double minPistonPressure { 10.0 };
};

// Init 2 leg objects
extern Leg* legStarboard;
extern Leg* legPort;