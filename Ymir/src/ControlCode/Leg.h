#pragma once
#include <string>

class PressureSensor
{
private:
    double reading;
    int pin;

public:
    enum class PressurePosition
    {
        ballast,
        shock,
    };
    PressureSensor(double reading, int pin);
    ~PressureSensor();
    uint16_t getReading();
};

class Solenoid
{
private:
    bool open;
    int pin;

public:
    enum class SolenoidPosition
    {
        ballast,
        shock,
        vent
    };
    Solenoid(bool open, int pin);
    ~Solenoid();
    bool isOpen();
    void toggleOpen();
};

class Leg
{

private:
    Solenoid ballastSolenoid;
    Solenoid shockSolenoid;
    Solenoid ventSolenoid;
    PressureSensor ballastPressureSensor;
    PressureSensor shockPressureSensor;
    std::string position;
    double ballastPressure;
    double shockPressure;

public:
    Leg(std::string position);
    ~Leg();
    std::string getPosition();
    bool isSolenoidOpen(Solenoid::SolenoidPosition position);
    void toggleSolenoid(Solenoid::SolenoidPosition position);
    uint16_t getPressureSensorReading(PressureSensor::PressurePosition position);
};
