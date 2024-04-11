#include "Leg.h"
#include <iostream>

int main()
{
    Leg LegStarboardAft = Leg("StarboardAft");
    Leg LegPortAft = Leg("PortAft");
    Leg LegStarboardBow = Leg("StarboardBow");
    Leg LegPortBow = Leg("PortBow");

    std::cout << "LegStarboardAft position " << LegStarboardAft.getPosition() << '\n';
    std::cout << "LegPortAft position " << LegPortAft.getPosition() << '\n';
    std::cout << "LegStarboardBow position " << LegStarboardBow.getPosition() << '\n';
    std::cout << "LegPortBow position " << LegPortBow.getPosition() << '\n';

    std::cout << "LegPortBow ballast solenoid isopen " << LegPortBow.isSolenoidOpen(Solenoid::SolenoidPosition::ballast) << '\n';
    LegPortBow.toggleSolenoid(Solenoid::SolenoidPosition::ballast);
    std::cout << "LegPortBow ballast solenoid isopen " << LegPortBow.isSolenoidOpen(Solenoid::SolenoidPosition::ballast) << '\n';
    std::cout << "LegPortBow ballast pressure sensor " << LegPortBow.getPressureSensorReading(PressureSensor::PressurePosition::ballast) << '\n';

    return 0;
}
