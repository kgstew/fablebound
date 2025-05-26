#pragma once

#include <string>
#include <vector>
#include "Leg.h" // Assuming you have a Leg class header
#include <ControlCode/json.hpp>
using json = nlohmann::json;

// enum class LegPosition
// {
//     STARBOARD,
//     PORT,
//     UNKNOWN_POSITION
// };

// LegPosition getLegPositions(const std::string &legPosition);

// enum class ValveType
// {
//     BALLAST_INTAKE_VALVE,
//     BALLAST_TO_PISTON_VALVE,
//     PISTON_RELEASE_VALVE,
//     UNKNOWN_VALVE
// };

// json getSystemStateJson(const std::string &messageType);

// ValveType getValveType(const std::string &solenoidPositionString);

// void updateLeg(Leg *leg, json& requestedState);

// void findLegsToUpdate(json& requestedState);
