#include "Leg.h"
#include <iostream>
#include <string>
#ifdef ARDUINO
#include <Arduino.h>
#else
#include "MockArduino/MockArduino.h"
#endif

int ballastFillPin = 23;
int pistonFillPin = 22;
int ventPin = 21;
int ballastPressureSensorPin = 32; // Location of the pins for the sensor and
int pistonPressureSensorPin = 33;
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

void Solenoid::setState(bool state)
{
    Serial.print("Setting Solenoid State");
    Serial.print(state);
    open = state;
    digitalWrite(pin, open ? HIGH : LOW);
}

/*


LEG


*/

Leg::Leg(std::string position)
    : ballastSolenoid(false, ballastFillPin),
      pistonSolenoid(false, pistonFillPin),
      ventSolenoid(false, ventPin),
      ballastPressureSensor(-1,
                            ballastPressureSensorPin),
      pistonPressureSensor(-1, pistonPressureSensorPin),
      position(position)
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

    case Solenoid::SolenoidPosition::piston:
        return Leg::pistonSolenoid.isOpen();

    case Solenoid::SolenoidPosition::vent:
        return Leg::ventSolenoid.isOpen();
    default: // This should never be reached
        return false;
    }
}

void Leg::toggleSolenoid(Solenoid::SolenoidPosition position)
{
    switch (position)
    {
    case Solenoid::SolenoidPosition::ballast:
        ballastSolenoid.toggleOpen();
        break;

    case Solenoid::SolenoidPosition::piston:
        pistonSolenoid.toggleOpen();
        break;

    case Solenoid::SolenoidPosition::vent:
        ventSolenoid.toggleOpen();
        break;
    }
}

uint16_t Leg::getPressureSensorReading(PressureSensor::PressurePosition position)
{
    switch (position)
    {
    case PressureSensor::PressurePosition::ballast:
        return ballastPressureSensor.getReading();

    case PressureSensor::PressurePosition::piston:
        return pistonPressureSensor.getReading();
    default: // This should never be reached
        return false;
    }
}

void Leg::setSolenoidState(Solenoid::SolenoidPosition position, bool state)
{
    Serial.printf("Set Solenoid State: state %s\n", state ? "true" : "false");
    switch (position)
    {
    case Solenoid::SolenoidPosition::ballast:
        ballastSolenoid.setState(state);
        break;

    case Solenoid::SolenoidPosition::piston:
        pistonSolenoid.setState(state);
        break;

    case Solenoid::SolenoidPosition::vent:
        ventSolenoid.setState(state);
        break;
    }
}

// void Leg::runLoop()
// {
//     while (true)
//     {
//         // Perform the necessary control code logic here

//         // When filling the BallastSolenoid of a Leg, the JackSolenoid must be closed
//         if (isSolenoidOpen(Solenoid::SolenoidPosition::ballast) && isSolenoidOpen(Solenoid::SolenoidPosition::jack))
//         {
//             toggleSolenoid(Solenoid::SolenoidPosition::jack);
//         }

//         // When filling the JackSolenoid of a Leg, the VentSolenoid must be closed
//         if (isSolenoidOpen(Solenoid::SolenoidPosition::jack) && isSolenoidOpen(Solenoid::SolenoidPosition::vent))
//         {
//             toggleSolenoid(Solenoid::SolenoidPosition::vent);
//         }

//         // If the Jack pressure exceeds 150 psi, the JackSolenoid is closed and the VentSolenoid opens until the pressure is less than 100 PSI
//         if (getPressureSensorReading(PressureSensor::PressurePosition::jack) > 150)
//         {
//             toggleSolenoid(Solenoid::SolenoidPosition::jack);
//             toggleSolenoid(Solenoid::SolenoidPosition::vent);
//             while (getPressureSensorReading(PressureSensor::PressurePosition::jack) > 100)
//             {
//                 // Wait until the pressure is less than 100 PSI
//             }
//             toggleSolenoid(Solenoid::SolenoidPosition::vent);
//         }

//         // If the JackSolenoid is closed and the pressure in the Ballast is less than 90 psi, the ballast solenoid opens
//         if (!isSolenoidOpen(Solenoid::SolenoidPosition::jack) && getPressureSensorReading(PressureSensor::PressurePosition::ballast) < 90)
//         {
//             toggleSolenoid(Solenoid::SolenoidPosition::ballast);
//         }

//         // The VentSolenoid is closed and will not open if the JackPressure is <= 30 PSI
//         if (getPressureSensorReading(PressureSensor::PressurePosition::jack) <= 30 && isSolenoidOpen(Solenoid::SolenoidPosition::vent))
//         {
//             toggleSolenoid(Solenoid::SolenoidPosition::vent);
//         }

//         // Add any additional control code logic here

//         // Sleep for a certain period of time before running the loop again
//         delay(1000); // Adjust the delay time as needed
//     }
// }

//
// When filling the BallastSolenoid of a Leg the JackSolenoid must be closed
// When filling the JackSolenoid of a Leg the VentSolenoid must be closed
// If the Jack pressure exceeds 150 psi the JackSolenoid is closed and the VentSolenoid opens until the pressure is less than 100 PSI
// If the JackSolenoid is closed and the pressure in the Ballast is less than 90 psi the ballast solenoid opens
// The VentSolenoid is closed and will not open if the JackPressure is <= 30 PSI