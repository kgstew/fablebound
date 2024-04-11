#include "Leg.h"
#include <iostream>
#include <string>

/*


PRESSURESENSOR


*/
PressureSensor::PressureSensor(double reading) : reading(reading)
{
}

PressureSensor::~PressureSensor()
{
}
double PressureSensor::getReading()
{
    return reading;
};

/*


SOLENOID


*/

Solenoid::Solenoid(bool open)
    : open(open) {}

Solenoid::~Solenoid() {}

bool Solenoid::isOpen()
{
    return open;
}

void Solenoid::toggleOpen()
{
    open = !open;
}

/*


LEG


*/

Leg::Leg(std::string position)
    : ballastSolenoid(false), shockSolenoid(false), ventSolenoid(false), ballastPressureSensor(0), shockPressureSensor(0), position(position)
{
    std::cout << "constructing " << position << '\n';
}

Leg::~Leg()
{
    std::cout << "destructing " << position << '\n';
}

std::string Leg::getPosition()
{
    return position;
}

bool Leg::isSolenoidOpen(Solenoid::SolenoidPosition position)
{
    switch (position)
    {
    case Solenoid::SolenoidPosition::ballast:
        return Leg::ballastSolenoid.isOpen();

    case Solenoid::SolenoidPosition::shock:
        return Leg::shockSolenoid.isOpen();

    case Solenoid::SolenoidPosition::vent:
        return Leg::ventSolenoid.isOpen();
    }
}

void Leg::toggleSolenoid(Solenoid::SolenoidPosition position)
{
    switch (position)
    {
    case Solenoid::SolenoidPosition::ballast:
        ballastSolenoid.toggleOpen();
        break;

    case Solenoid::SolenoidPosition::shock:
        shockSolenoid.toggleOpen();

    case Solenoid::SolenoidPosition::vent:
        ventSolenoid.toggleOpen();
    }
}

double Leg::getPressureSensorReading(PressureSensor::PressurePosition position)
{
    switch (position)
    {
    case PressureSensor::PressurePosition::ballast:
        return ballastPressureSensor.getReading();

    case PressureSensor::PressurePosition::shock:
        return shockPressureSensor.getReading();
    }
}
