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
        piston,
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
        piston,
        vent
    };
    Solenoid(bool open, int pin);
    ~Solenoid();
    bool isOpen();
    void toggleOpen();
    void setState(bool state);
};

class Leg
{

private:
    Solenoid ballastSolenoid;
    Solenoid pistonSolenoid;
    Solenoid ventSolenoid;
    PressureSensor ballastPressureSensor;
    PressureSensor pistonPressureSensor;
    std::string position;
    double ballastPressure;
    double pistonPressure;

public:
    Leg(std::string position);
    ~Leg();
    std::string getPosition();
    bool isSolenoidOpen(Solenoid::SolenoidPosition position);
    void toggleSolenoid(Solenoid::SolenoidPosition position);
    void setSolenoidState(Solenoid::SolenoidPosition position, bool state);
    uint16_t getPressureSensorReading(PressureSensor::PressurePosition position);
};
