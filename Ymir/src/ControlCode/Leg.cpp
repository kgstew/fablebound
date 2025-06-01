#include "Leg.h"

// uncomment to enable debug print statements to the serial monitor
#define DEBUG

// debug macro
#ifdef DEBUG
#define DBG(x) x
#else
#define DBG(x)
#endif

////////////////////////////////////////////////////////////////////////////////////////////////////
// DISTANCE SENSOR
////////////////////////////////////////////////////////////////////////////////////////////////////

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
    // Timeout is 50 ms; assumes max 20 Hz sample rate (50 ms sample delta)
    constexpr unsigned long timeout = 50000;
    auto timeDelta = pulseIn(echoPin, HIGH, timeout);
    double distanceCm = 0.0;

    if (timeDelta > 0) {
        distanceCm = static_cast<double>(timeDelta) * SOUND_SPEED * 0.5;
    } else {
        distanceCm = reading; // hold if reading timed out
    }

    // Convert to inches
    DBG(double distanceIn = distanceCm * CM_TO_INCH;)
    Prints the distance in the Serial Monitor
    DBG(Serial.print("Distance (cm): "));
    DBG(Serial.println(distanceCm));
    DBG(Serial.print("Distance (inch): "));
    DBG(Serial.println(distanceIn));

    reading = distanceCm;

    // Exponential moving average
    // Impulse response decays by a factor of 1/e (~ 0.3678) after 4 samples
    // -6 dB around SR / 4; slope about -6 dB / octave
    // N.B.: assumes getReading is called at a consistent rate
    constexpr double coeff = std::exp(-1.0 / 4.0);
    averageReading = averageReading + coeff * (reading - averageReading);

    return distanceCm;
};

double DistanceSensor::getLastReading() const noexcept { return reading; }

double DistanceSensor::getAverageReading() const noexcept { return averageReading; }

int DistanceSensor::getTriggerPin() const noexcept { return triggerPin; }

int DistanceSensor::getEchoPin() const noexcept { return echoPin; }

DistanceSensor::Position DistanceSensor::getPosition() const noexcept { return position; }

std::string DistanceSensor::getPositionAsString() const noexcept
{
    switch (position) {
    case DistanceSensor::Position::none:
        return std::string { "distanceSensorPosition" };
    default: { // This should never happen
        DBG(Serial.println("Invalid distance sensor position"));
        return std::string { "invalid" };
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

void PressureSensor::setup() { pinMode(pin, INPUT); }

double PressureSensor::getReading()
{
    reading = static_cast<double>(analogRead(pin)) / 28.0;

    // Exponential moving average
    // Impulse response decays by a factor of 1/e (~ 0.3678) after 4 samples
    // -6 dB around SR / 4; slope about -6 dB / octave
    // N.B.: assumes getReading is called at a consistent rate
    constexpr double coeff = std::exp(-1.0 / 4.0);
    averageReading = averageReading + coeff * (reading - averageReading);

    return reading;
}

double PressureSensor::getAverageReading() const noexcept { return averageReading; }

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
        DBG(Serial.println("Invalid pressure sensor position"));
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
    DBG(Serial.printf("setState (string): %s\n", newState.c_str());)

    if (newState == std::string { "open" }) {
        writeState(Solenoid::State::open);
        state = Solenoid::State::open;
    } else if (newState == std::string { "closed" }) {
        writeState(Solenoid::State::closed);
        state = Solenoid::State::closed;
    } else {
        // default to closing the solenoid/valve to prevent
        // overpressurizing the ballast, piston, etc.
        DBG(Serial.println("Invalid solenoid state string"));
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
        DBG(Serial.println("Invalid solenoid position"));
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
        DBG(Serial.println("Invalid solenoid state"));
        return std::string { "invalid" };
    }
    }
}

void Solenoid::writeState(Solenoid::State state)
{
    DBG(Serial.printf("Solenoid::writeState: %i\n", state == defaultState ? "LOW" : "HIGH" ));
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
        DBG(Serial.println("Invalid solenoid position"));
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
        DBG(Serial.println("Invalid pressure sensor position"));
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
        DBG(Serial.println("Invalid leg position"));
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

json Leg::getLastStateWithAverageDistanceAsJson() const noexcept
{
    return json { // clang-format off
        { ballastSolenoid.getPositionAsString(), ballastSolenoid.getStateAsString() },
        { pistonSolenoid.getPositionAsString(), pistonSolenoid.getStateAsString() },
        { ventSolenoid.getPositionAsString(), ventSolenoid.getStateAsString() },
        { ballastPressureSensor.getPositionAsString(), ballastPressureSensor.getLastReading() },
        { pistonPressureSensor.getPositionAsString(), pistonPressureSensor.getLastReading() },
        { distanceSensor.getPositionAsString(), distanceSensor.getAverageReading() } 
    }; // clang-format on
}

json Leg::getLastStateWithAverageReadingsAsJson() const noexcept
{
    return json { // clang-format off
        { ballastSolenoid.getPositionAsString(), ballastSolenoid.getStateAsString() },
        { pistonSolenoid.getPositionAsString(), pistonSolenoid.getStateAsString() },
        { ventSolenoid.getPositionAsString(), ventSolenoid.getStateAsString() },
        { ballastPressureSensor.getPositionAsString(), ballastPressureSensor.getAverageReading() },
        { pistonPressureSensor.getPositionAsString(), pistonPressureSensor.getAverageReading() },
        { distanceSensor.getPositionAsString(), distanceSensor.getAverageReading() } 
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