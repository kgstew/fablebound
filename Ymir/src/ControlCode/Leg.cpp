#include "Leg.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
// DISTANCE SENSOR
////////////////////////////////////////////////////////////////////////////////////////////////////

// #include <SoftwareSerial.h>

// SoftwareSerial mySerial(11, 10); // RX, TX
// unsigned char data[4] = {};
// float distance;

// void setup()
// {
//     Serial.begin(57600);
//     mySerial.begin(9600);
// }

// void loop()
// {
//     do {
//         for (int i = 0; i < 4; i++) {
//             data[i] = mySerial.read();
//         }
//     } while (mySerial.read() == 0xff);

//     mySerial.flush();

//     if (data[0] == 0xff) {
//         int sum;
//         sum = (data[0] + data[1] + data[2]) & 0x00FF;
//         if (sum == data[3]) {
//             distance = (data[1] << 8) + data[2];
//             if (distance > 30) {
//                 Serial.print("distance=");
//                 Serial.print(distance / 10);
//                 Serial.println("cm");
//             } else {
//                 Serial.println("Below the lower limit");
//             }
//         } else
//             Serial.println("ERROR");
//     }
//     delay(100);
// }

DistanceSensor::DistanceSensor(DistanceSensor::Position position, int triggerPin, int echoPin)
    : position(position)
    , reading(-1.0)
    , triggerPin(triggerPin)
    , echoPin(echoPin)
{
}

void DistanceSensor::setup()
{
    pinMode(triggerPin, OUTPUT);
    pinMode(echoPin, INPUT);
    getReading(); // get initial reading
}

double DistanceSensor::getReading()
{
    // Clears the triggerPin
    digitalWrite(triggerPin, LOW);
    delayMicroseconds(2);
    // Sets the triggerPin on HIGH state for 10 micro seconds
    digitalWrite(triggerPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(triggerPin, LOW);

    // Reads the echoPin, returns the sound wave travel time in microseconds
    double distanceAverageCm = 0.0;
    double distanceAverageIn = 0.0;
    constexpr size_t N = 1;
    for (size_t i = 0; i < N; i++) {
        auto timeDelta = pulseIn(echoPin, HIGH);
        distanceAverageCm += static_cast<double>(timeDelta) * SOUND_SPEED * 0.5;
    }
    // Calculate the distance
    distanceAverageCm /= static_cast<double>(N);
    // Convert to inches
    distanceAverageIn = distanceAverageCm * CM_TO_INCH;

    // Prints the distance in the Serial Monitor
    Serial.print("Distance (cm): ");
    Serial.println(distanceAverageCm);
    Serial.print("Distance (inch): ");
    Serial.println(distanceAverageIn);

    reading = distanceAverageCm;
    return distanceAverageCm;
};

double DistanceSensor::getLastReading() const noexcept { return reading; }

int DistanceSensor::getTriggerPin() const noexcept { return triggerPin; }

int DistanceSensor::getEchoPin() const noexcept { return echoPin; }

DistanceSensor::Position DistanceSensor::getPosition() const noexcept { return position; }

std::string DistanceSensor::getPositionAsString() const noexcept
{
    switch (position) {
    case DistanceSensor::Position::none:
        return std::string { "distanceSensorPosition" };
    default: { // This should never happen
        Serial.println("Invalid distance sensor position");
        return std::string { "" };
    }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// PRESSURE SENSOR
////////////////////////////////////////////////////////////////////////////////////////////////////

PressureSensor::PressureSensor(PressureSensor::Position position, int pin)
    : position(position)
    , reading(-1.0)
    , pin(pin)
{
}

void PressureSensor::setup()
{
    pinMode(pin, INPUT);
    getReading(); // get initial reading
}

double PressureSensor::getReading()
{
    reading = static_cast<double>(analogRead(pin)) / 28.0;
    // float voltage = 5.0 * reading / 4095; // voltage = 0..5V;  we do the math in millivolts!!
    // map(value, fromLow, fromHigh, toLow, toHigh)
    return reading; // map(voltage, 0.5, 3.0, 0.0, 150.0); // Arduino map() function
}

double PressureSensor::getLastReading() const noexcept { return reading; }

int PressureSensor::getPin() const noexcept { return pin; }

PressureSensor::Position PressureSensor::getPosition() const noexcept { return position; }

std::string PressureSensor::getPositionAsString() const noexcept
{
    switch (position) {
    case PressureSensor::Position::ballast:
        return std::string { "ballastPressurePsi" };
    case PressureSensor::Position::piston:
        return std::string { "pistonPressurePsi" };
    default: { // This should never happen
        Serial.println("Invalid pressure sensor position");
        return std::string { "invalid" };
    }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// SOLENOID
////////////////////////////////////////////////////////////////////////////////////////////////////

Solenoid::Solenoid(Solenoid::Position position, Solenoid::State defaultState, int pin)
    : position(position)
    , defaultState(defaultState)
    , state(defaultState)
    , pin(pin)
{
}

void Solenoid::setup() 
{
    pinMode(pin, OUTPUT);
    writeState(defaultState);
}

bool Solenoid::isOpen() const noexcept { return state == Solenoid::State::open; }

bool Solenoid::isClosed() const noexcept { return state == Solenoid::State::closed; }

Solenoid::State Solenoid::getState() const noexcept { return state; }

Solenoid::State Solenoid::getDefaultState() const noexcept { return defaultState; }

void Solenoid::setState(Solenoid::State newState)
{
    writeState(newState);
    state = newState;
}

void Solenoid::setState(std::string& newState)
{
    if (newState == "open") {
        writeState(Solenoid::State::open);
        state = Solenoid::State::open;
    } else if (newState == "closed") {
        writeState(Solenoid::State::closed);
        state = Solenoid::State::closed;
    } else {
        // default to closing the solenoid/valve to prevent 
        // overpressurizing the ballast, piston, etc.
        Serial.println("Invalid solenoid state string");
        reset();
    }
}

void Solenoid::setOpen(bool open)
{
    if (open) {
        writeState(Solenoid::State::open);
        state = Solenoid::State::open;
    } else {
        writeState(Solenoid::State::closed);
        state = Solenoid::State::closed;
    }
}

void Solenoid::reset()
{
    writeState(defaultState);
    state = defaultState;
}

int Solenoid::getPin() const noexcept { return pin; }

Solenoid::Position Solenoid::getPosition() const noexcept { return position; }

std::string Solenoid::getPositionAsString() const noexcept
{
    switch (position) {
    case Solenoid::Position::ballast:
        return std::string { "ballastIntakeValve" };
    case Solenoid::Position::piston:
        return std::string { "ballastToPistonValve" };
    case Solenoid::Position::vent:
        return std::string { "pistonReleaseValve" };
    default: { // This should never happen
        Serial.println("Invalid solenoid position");
        return std::string { "invalid" };
    }
    }
}

std::string Solenoid::getStateAsString() const noexcept
{
    switch (state) {
    case Solenoid::State::open: {
        return std::string { "open" };
    }
    case Solenoid::State::closed: {
        return std::string { "closed" };
    }
    default: { // This should never happen
        Serial.println("Invalid solenoid state");
        return std::string { "invalid" };
    }
    }
}

void Solenoid::writeState(Solenoid::State state) 
{
    assert((state == Solenoid::State::open) || (state == Solenoid::State::closed));
    digitalWrite(pin, state == defaultState ? LOW : HIGH);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// LEG
////////////////////////////////////////////////////////////////////////////////////////////////////

Leg::Leg(Leg::Position position, int ballastFillPin, int pistonFillPin, int ventPin, int ballastPressureSensorPin,
    int pistonPressureSensorPin, int distanceSensorTriggerPin, int distanceSensorEchoPin)
    : position(position)
    , ballastSolenoid(Solenoid::Position::ballast, Solenoid::State::closed, ballastFillPin)
    , pistonSolenoid(Solenoid::Position::piston, Solenoid::State::closed, pistonFillPin)
    , ventSolenoid(Solenoid::Position::vent, Solenoid::State::closed, ventPin)
    , ballastPressureSensor(PressureSensor::Position::ballast, ballastPressureSensorPin)
    , pistonPressureSensor(PressureSensor::Position::piston, pistonPressureSensorPin)
    , distanceSensor(DistanceSensor::Position::none, distanceSensorTriggerPin, distanceSensorEchoPin)
{
}

void Leg::setup()
{
    ballastSolenoid.setup();
    pistonSolenoid.setup();
    ventSolenoid.setup();

    ballastPressureSensor.setup();
    pistonPressureSensor.setup();

    distanceSensor.setup(); 
}

Solenoid& Leg::getSolenoid(Solenoid::Position position)
{
    switch (position) {
    case Solenoid::Position::ballast: {
        return ballastSolenoid;
    }
    case Solenoid::Position::piston: {
        return pistonSolenoid;
    }
    case Solenoid::Position::vent: {
        return ventSolenoid;
    }
    default: { // This should never be reached
        Serial.println("Invalid solenoid position");
        throw std::runtime_error("Invalid solenoid position");
    }
    }
}

PressureSensor& Leg::getPressureSensor(PressureSensor::Position position)
{
    switch (position) {
    case PressureSensor::Position::ballast: {
        return ballastPressureSensor;
    }
    case PressureSensor::Position::piston: {
        return pistonPressureSensor;
    }
    default: {
        Serial.println("Invalid pressure sensor position");
        throw std::runtime_error("Invalid pressure sensor position");
    }
    }
}

DistanceSensor& Leg::getDistanceSensor() noexcept { return distanceSensor; }

std::vector<std::reference_wrapper<Solenoid>> Leg::getSolenoids() noexcept
{ // clang-format off
    return std::vector<std::reference_wrapper<Solenoid>> { 
        std::ref(ballastSolenoid),
        std::ref(pistonSolenoid),
        std::ref(ventSolenoid) 
    };
} // clang-format on

std::vector<std::reference_wrapper<PressureSensor>> Leg::getPressureSensors() noexcept
{ // clang-format off
    return std::vector<std::reference_wrapper<PressureSensor>> { 
        std::ref(ballastPressureSensor), 
        std::ref(pistonPressureSensor)
    };
} // clang-format on

std::vector<std::reference_wrapper<DistanceSensor>> Leg::getDistanceSensors() noexcept
{ // clang-format off
    return std::vector<std::reference_wrapper<DistanceSensor>> { 
        std::ref(distanceSensor)
    };
} // clang-format on

Leg::Position Leg::getPosition() const noexcept { return position; }

std::string Leg::getPositionAsString() const noexcept
{
    switch (position) {
    case Leg::Position::port:
        return std::string { "port" };
    case Leg::Position::starboard:
        return std::string { "starboard" };
    default: { // This should never happen
        Serial.println("Invalid leg position");
        return std::string { "invalid" };
    }
    }
}

json Leg::getStateAsJson()
{
    return json { // clang-format off
        { ballastSolenoid.getPositionAsString(), ballastSolenoid.getStateAsString() },
        { pistonSolenoid.getPositionAsString(), pistonSolenoid.getStateAsString() },
        { ventSolenoid.getPositionAsString(), ventSolenoid.getStateAsString() },
        { ballastPressureSensor.getPositionAsString(), ballastPressureSensor.getReading() },
        { pistonPressureSensor.getPositionAsString(), pistonPressureSensor.getReading() },
        { distanceSensor.getPositionAsString(), distanceSensor.getReading() } 
    }; // clang-format on
}

json Leg::getLastStateAsJson() const noexcept
{
    return json { // clang-format off
        { ballastSolenoid.getPositionAsString(), ballastSolenoid.getStateAsString() },
        { pistonSolenoid.getPositionAsString(), pistonSolenoid.getStateAsString() },
        { ventSolenoid.getPositionAsString(), ventSolenoid.getStateAsString() },
        { ballastPressureSensor.getPositionAsString(), ballastPressureSensor.getLastReading() },
        { pistonPressureSensor.getPositionAsString(), pistonPressureSensor.getLastReading() },
        { distanceSensor.getPositionAsString(), distanceSensor.getLastReading() } 
    }; // clang-format on
}

// void Leg::runLoop()
// {
//     while (true)
//     {
//         // Perform the necessary control code logic here

//         // When filling the BallastSolenoid of a Leg, the JackSolenoid must be closed
//         if (isSolenoidOpen(Solenoid::Position::ballast) && isSolenoidOpen(Solenoid::Position::jack))
//         {
//             toggleSolenoid(Solenoid::Position::jack);
//         }

//         // When filling the JackSolenoid of a Leg, the VentSolenoid must be closed
//         if (isSolenoidOpen(Solenoid::Position::jack) && isSolenoidOpen(Solenoid::Position::vent))
//         {
//             toggleSolenoid(Solenoid::Position::vent);
//         }

//         // If the Jack pressure exceeds 150 psi, the JackSolenoid is closed and the VentSolenoid opens until the
//         pressure is less than 100 PSI if (getPressureSensorReading(PressureSensor::Position::jack) > 150)
//         {
//             toggleSolenoid(Solenoid::Position::jack);
//             toggleSolenoid(Solenoid::Position::vent);
//             while (getPressureSensorReading(PressureSensor::Position::jack) > 100)
//             {
//                 // Wait until the pressure is less than 100 PSI
//             }
//             toggleSolenoid(Solenoid::Position::vent);
//         }

//         // If the JackSolenoid is closed and the pressure in the Ballast is less than 90 psi, the ballast
//         solenoid opens if (!isSolenoidOpen(Solenoid::Position::jack) &&
//         getPressureSensorReading(PressureSensor::Position::ballast) < 90)
//         {
//             toggleSolenoid(Solenoid::Position::ballast);
//         }

//         // The VentSolenoid is closed and will not open if the JackPressure is <= 30 PSI
//         if (getPressureSensorReading(PressureSensor::Position::jack) <= 30 &&
//         isSolenoidOpen(Solenoid::Position::vent))
//         {
//             toggleSolenoid(Solenoid::Position::vent);
//         }

//         // Add any additional control code logic here

//         // Sleep for a certain period of time before running the loop again
//         delay(1000); // Adjust the delay time as needed
//     }
// }

//
// Safety Rules:
// If the Jack pressure exceeds 150 psi the JackSolenoid is closed and the VentSolenoid opens until the pressure is
// less than 100 PSI The VentSolenoid is closed and will not open if the JackPressure is <= 30 PSI If the esp32
// disconnects from the websocket server all solenoids are closed