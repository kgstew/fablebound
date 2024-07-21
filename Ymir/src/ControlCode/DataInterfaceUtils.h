#pragma once

#include <string>
#include <vector>
#include "Leg.h" // Assuming you have a Leg class header
#include <ControlCode/json.hpp>
using json = nlohmann::json;

enum LegPosition
{
    STARBOARD,
    PORT,
    UNKNOWN_POSITION
};

LegPosition getLegPositions(const std::string &legPosition);

enum ValveType
{
    BALLAST_INTAKE_VALVE,
    BALLAST_TO_PISTON_VALVE,
    PISTON_RELEASE_VALVE,
    UNKNOWN_VALVE
};

ValveType getValveType(const std::string &valveName);

void updateLeg(Leg *leg, json leg_state);

void findLegsToUpdate(json desired_state);

json getStateJson(const std::string &messageType);