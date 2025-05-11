#include "DataInterfaceUtils.h"
#include "Leg.h"
#include <Arduino.h>

json getStateJson(const std::string& messageType)
{
    json system_state = { { "type", messageType }, { "sendTime", "notime" },
        { "bigAssMainTank", { { "pressurePsi", 0 }, { "compressorToTankValve", "closed" } } },
        { "starboard",
            { { "ballastPressurePsi",
                    LegStarboard->getPressureSensorReading(PressureSensor::PressurePosition::ballast) },
                { "pistonPressurePsi",
                    LegStarboard->getPressureSensorReading(PressureSensor::PressurePosition::piston) },
                { "ballastIntakeValve",
                    LegStarboard->isSolenoidOpen(Solenoid::SolenoidPosition::ballast) ? "open" : "closed" },
                { "ballastToPistonValve",
                    LegStarboard->isSolenoidOpen(Solenoid::SolenoidPosition::piston) ? "open" : "closed" },
                { "pistonReleaseValve",
                    LegStarboard->isSolenoidOpen(Solenoid::SolenoidPosition::vent) ? "open" : "closed" },
                {"distanceSensorPosition",
                    LegStarboard->getDistanceSensorReading()} } },
        { "port",
            { 
                { "ballastPressurePsi", 
                    LegPort->getPressureSensorReading(PressureSensor::PressurePosition::ballast) },
                { "pistonPressurePsi", 
                    LegPort->getPressureSensorReading(PressureSensor::PressurePosition::piston) },
                { "ballastIntakeValve",
                    LegPort->isSolenoidOpen(Solenoid::SolenoidPosition::ballast) ? "open" : "closed" },
                { "ballastToPistonValve",
                    LegPort->isSolenoidOpen(Solenoid::SolenoidPosition::piston) ? "open" : "closed" },
                { "pistonReleaseValve",
                    LegPort->isSolenoidOpen(Solenoid::SolenoidPosition::vent) ? "open" : "closed" },
                {"distanceSensorPosition",
                    LegPort->getDistanceSensorReading()} } 
                }};
    return system_state;
}

LegPosition getLegPositions(const std::string& legPosition)
{
    if (legPosition == "starboard") {
        return STARBOARD;
    } else if (legPosition == "port") {
        return PORT;
    } else {
        return UNKNOWN_POSITION;
    }
}

ValveType getValveType(const std::string& valveName)
{
    if (valveName == "ballastIntakeValve") {
        return BALLAST_INTAKE_VALVE;
    } else if (valveName == "ballastToPistonValve") {
        return BALLAST_TO_PISTON_VALVE;
    } else if (valveName == "pistonReleaseValve") {
        return PISTON_RELEASE_VALVE;
    } else {
        return UNKNOWN_VALVE;
    }
}

void updateLeg(Leg* leg, json leg_state)
{
    if (leg == nullptr) {
        Serial.println("Error: leg pointer is null");
        return;
    }

    Serial.println("Updating Leg: ");
    Serial.printf("leg %p\n", leg);
    auto output = leg_state.dump();
    Serial.println(output.c_str());

    // List of valves to check
    std::vector<std::string> valves = { "ballastIntakeValve", "ballastToPistonValve", "pistonReleaseValve" };

    for (const auto& valveName : valves) {
        if (leg_state.contains(valveName)) {
            ValveType valveType = getValveType(valveName);
            bool open = leg_state[valveName] == "open";

            switch (valveType) {
            case BALLAST_INTAKE_VALVE:
                Serial.printf("%s ballastIntakeValve\n", open ? "Opening" : "Closing");
                leg->setSolenoidState(Solenoid::SolenoidPosition::ballast, open);
                break;

            case BALLAST_TO_PISTON_VALVE:
                Serial.printf("%s ballastToPistonValve\n", open ? "Opening" : "Closing");
                leg->setSolenoidState(Solenoid::SolenoidPosition::piston, open);
                break;

            case PISTON_RELEASE_VALVE:
                Serial.printf("%s pistonReleaseValve\n", open ? "Opening" : "Closing");
                leg->setSolenoidState(Solenoid::SolenoidPosition::vent, open);
                break;

            case UNKNOWN_VALVE:
            default:
                Serial.printf("Unknown valve: %s\n", valveName.c_str());
                break;
            }
        }
        // else
        // {
        //     Serial.printf("Error: '%s' key is missing in leg_state\n", valveName.c_str());
        // }
    }
}

void findLegsToUpdate(json desired_state)
{
    // List of valves to check
    std::vector<std::string> positions = { "starboard", "port"};

    for (const auto& position : positions) {
        if (desired_state.contains(position)) {
            LegPosition legPosition = getLegPositions(position);

            switch (legPosition) {
            case STARBOARD:
                Serial.printf("%s updating \n", position.c_str());
                updateLeg(LegStarboard, desired_state[position]);
                break;
            case PORT:
                Serial.printf("%s updating \n", position.c_str());
                updateLeg(LegPort, desired_state[position]);
                break;
            default:
                Serial.printf("Unknown position: %s\n", position.c_str());
                break;
            }
        }
        // else
        // {
        //     Serial.printf("Error: '%s' key is missing in desired_state\n", position.c_str());
        // }
    }
}
