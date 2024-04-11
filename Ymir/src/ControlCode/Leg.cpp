#include "Leg.h"
#include <iostream>
#include <string>
#include <Arduino.h>

int ballastFillPin = 14;
int shockFillPin = 15;
int ventPin = 16;
int sensorPin = 17; // Location of the pins for the sensor and valves on Teensy 4.1

/*


PRESSURESENSOR


*/
PressureSensor::PressureSensor(double reading, int pin) : reading(reading), pin(pin)
{
    pinMode(pin, INPUT);
}

PressureSensor::~PressureSensor()
{
}
uint16_t PressureSensor::getReading()
{
    uint16_t reading = analogRead(pin);
    return reading;
};

/*


SOLENOID


*/

Solenoid::Solenoid(bool open, int pin)
    : open(open), pin(pin)
{
    pinMode(pin, INPUT);
    digitalWrite(pin, LOW);
}

Solenoid::~Solenoid() {}

bool Solenoid::isOpen()
{
    return open;
}

void Solenoid::toggleOpen()
{
    open = !open;
    digitalWrite(pin, open ? HIGH : LOW);
    Serial.print("Updates Solenoid Status");
}

/*


LEG


*/

Leg::Leg(std::string position)
    : ballastSolenoid(false, ballastFillPin), shockSolenoid(false, shockFillPin), ventSolenoid(false, ventPin), ballastPressureSensor(-1, sensorPin), shockPressureSensor(-1, sensorPin), position(position)
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

uint16_t Leg::getPressureSensorReading(PressureSensor::PressurePosition position)
{
    switch (position)
    {
    case PressureSensor::PressurePosition::ballast:
        return ballastPressureSensor.getReading();

    case PressureSensor::PressurePosition::shock:
        return shockPressureSensor.getReading();
    }
}
