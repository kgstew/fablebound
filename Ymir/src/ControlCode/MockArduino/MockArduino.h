#ifndef MOCK_ARDUINO_H
#define MOCK_ARDUINO_H

#include <iostream>
#include <string>

// Define constants similar to those used in Arduino
#define INPUT 0x0
#define OUTPUT 0x1
#define HIGH 0x1
#define LOW 0x0

// Mocks for various Arduino functions
void pinMode(int pin, int mode);
void digitalWrite(int pin, int value);
int digitalRead(int pin);
int analogRead(int pin);
void analogWrite(int pin, int value);

class MockSerial
{
public:
    void begin(int baudRate);
    void println(const std::string &message);
    void println(int num);
    void print(const std::string &message);
    void print(int num);
};

extern MockSerial Serial;

#endif
