#pragma once
#include <string>

class PressureSensor
{
private:
    double reading;

public:
    enum class PressurePosition
    {
        ballast,
        shock,
    };
    PressureSensor(double reading);
    ~PressureSensor();
    double getReading();
};

class Solenoid
{
private:
    bool open;

public:
    enum class SolenoidPosition
    {
        ballast,
        shock,
        vent
    };
    Solenoid(bool open);
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
    double getPressureSensorReading(PressureSensor::PressurePosition position);
};
