#ifndef ARDUINO // Only compile this file for non-Arduino environments
#include "MockArduino.h"

void pinMode(int pin, int mode)
{
    std::string modeStr = (mode == INPUT) ? "INPUT" : "OUTPUT";
    std::cout << "Setting pin " << pin << " to mode " << modeStr << std::endl;
}

void digitalWrite(int pin, int value)
{
    std::string valueStr = (value == HIGH) ? "HIGH" : "LOW";
    std::cout << "Writing value " << valueStr << " to pin " << pin << std::endl;
}

int digitalRead(int pin)
{
    return LOW; // Mock returning low
}

int analogRead(int pin)
{
    return 512; // Mock returning mid-scale value
}

void analogWrite(int pin, int value)
{
    std::cout << "Analog write " << value << " to pin " << pin << std::endl;
}

MockSerial Serial;

void MockSerial::begin(int baudRate)
{
    std::cout << "Serial started at " << baudRate << " bps" << std::endl;
}

void MockSerial::println(const std::string &message)
{
    std::cout << message << std::endl;
}

void MockSerial::println(int num)
{
    std::cout << num << std::endl;
}

void MockSerial::print(const std::string &message)
{
    std::cout << message;
}

void MockSerial::print(int num)
{
    std::cout << num;
}

#endif