#pragma once
#include <string>

#define SOUND_SPEED 0.0343
#define CM_TO_INCH 0.393701

class DistanceSensor {
private:
    double reading;
    int triggerPin;
    int echoPin;

public:
    DistanceSensor(double reading, int triggerPin, int echoPin);
    ~DistanceSensor();
    uint16_t getReading();
};

class PressureSensor {
private:
    double reading;
    int pin;

public:
    enum class PressurePosition {
        ballast,
        piston,
    };
    PressureSensor(double reading, int pin);
    ~PressureSensor();
    uint16_t getReading();
};

class Solenoid {
private:
    bool open;
    int pin;

public:
    enum class SolenoidPosition { ballast, piston, vent };
    Solenoid(bool open, int pin);
    ~Solenoid();
    bool isOpen();
    void setState(bool state);
};

class Leg {

private:
    Solenoid ballastSolenoid;
    Solenoid pistonSolenoid;
    Solenoid ventSolenoid;
    PressureSensor ballastPressureSensor;
    PressureSensor pistonPressureSensor;
    DistanceSensor distanceSensor;
    std::string position;
    double ballastPressure;
    double pistonPressure;
    double distance;

    int ballastFillPin;
    int pistonFillPin;
    int ventPin;
    int ballastPressureSensorPin; // Location of the pins for the sensor and
    int pistonPressureSensorPin;
    int ultrasonicTriggerPin;
    int ultrasonicEchoPin;

public:
    Leg(std::string position, int ballastFillPin, int pistonFillPin, int ventPin, int ballastPressureSensorPin,
        int pistonPressureSensorPin, int ultrasonicTriggerPin, int ultrasonicEchoPin);
    ~Leg();
    std::string getPosition();
    std::string getDistance();
    bool isSolenoidOpen(Solenoid::SolenoidPosition position);
    void setSolenoidState(Solenoid::SolenoidPosition position, bool state);
    uint16_t getPressureSensorReading(PressureSensor::PressurePosition position);
    uint16_t getDistanceSensorReading();
};

// Init 2 leg objects
extern Leg* LegStarboard;
extern Leg* LegPort;