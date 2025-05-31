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

    DistanceSensor(DistanceSensor::Position position, int triggerPin, int echoPin);
    void setup();
    double getReading();
    double getLastReading() const noexcept;
    double getAverageReading() const noexcept;
    int getTriggerPin() const noexcept;
    int getEchoPin() const noexcept;
    DistanceSensor::Position getPosition() const noexcept;
    std::string getPositionAsString() const noexcept;

private:
    const DistanceSensor::Position position;
    const int triggerPin;
    const int echoPin;
    double reading;
    double averageReading = 0.0;
};

class PressureSensor {
public:
    enum class Position { ballast, piston };

    PressureSensor(PressureSensor::Position position, int pin);
    void setup();
    double getReading();
    double getLastReading() const noexcept;
    double getAverageReading() const noexcept;
    int getPin() const noexcept;
    PressureSensor::Position getPosition() const noexcept;
    std::string getPositionAsString() const noexcept;

private:
    const PressureSensor::Position position;
    const int pin;
    double reading;
    double averageReading = 0.0;
};

class Solenoid {
public:
    enum class Position { ballast, piston, vent };
    enum class State { open, closed };

    Solenoid(Solenoid::Position position, Solenoid::State defaultState, int pin);
    void setup();
    Solenoid::State getState() const noexcept;
    Solenoid::State getDefaultState() const noexcept;
    void setState(Solenoid::State newState);
    void setState(std::string& newState);
    void setOpen(bool open);
    void reset();
    bool isOpen() const noexcept;
    bool isClosed() const noexcept;
    int getPin() const noexcept;
    Solenoid::Position getPosition() const noexcept;
    std::string getPositionAsString() const noexcept;
    std::string getStateAsString() const noexcept;

private:
    void writeState(Solenoid::State state);
    const Solenoid::Position position;
    const Solenoid::State defaultState; // i.e. whether the solenoid is normally open or normally closed
    const int pin;
    Solenoid::State state;
};

class Leg {
public:
    enum class Position { port, starboard };

    Leg(Leg::Position position, int ballastFillPin, int pistonFillPin, int ventPin, int ballastPressureSensorPin,
        int pistonPressureSensorPin, int distanceSensorTriggerPin, int distanceSensorEchoPin);
    void setup();
    Solenoid& getSolenoid(Solenoid::Position position);
    PressureSensor& getPressureSensor(PressureSensor::Position position);
    DistanceSensor& getDistanceSensor() noexcept;

    std::vector<std::reference_wrapper<Solenoid>> getSolenoids() noexcept;
    std::vector<std::reference_wrapper<PressureSensor>> getPressureSensors() noexcept;
    std::vector<std::reference_wrapper<DistanceSensor>> getDistanceSensors() noexcept;

    Leg::Position getPosition() const noexcept;
    std::string getPositionAsString() const noexcept;

    json getStateAsJson();
    json getLastStateAsJson() const noexcept;
    json getLastStateWithAverageDistanceAsJson() const noexcept;
    json getLastStateWithAverageReadingsAsJson() const noexcept;

protected:
    Solenoid ballastSolenoid;
    Solenoid pistonSolenoid;
    Solenoid ventSolenoid;
    PressureSensor ballastPressureSensor;
    PressureSensor pistonPressureSensor;
    DistanceSensor distanceSensor;
    const Leg::Position position;
};