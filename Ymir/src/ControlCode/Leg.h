#pragma once
#include <string>

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
    std::string position;
    double ballastPressure;
    double pistonPressure;

    int ballastFillPin;
    int pistonFillPin;
    int ventPin;
    int ballastPressureSensorPin; // Location of the pins for the sensor and
    int pistonPressureSensorPin;

public:
    Leg(std::string position, int ballastFillPin, int pistonFillPin, int ventPin, int ballastPressureSensorPin,
        int pistonPressureSensorPin);
    ~Leg();
    std::string getPosition();
    bool isSolenoidOpen(Solenoid::SolenoidPosition position);
    void setSolenoidState(Solenoid::SolenoidPosition position, bool state);
    uint16_t getPressureSensorReading(PressureSensor::PressurePosition position);
};

// Init 4 leg objects
extern Leg* LegStarboardStern;
extern Leg* LegPortStern;
extern Leg* LegStarboardBow;
extern Leg* LegPortBow;