#!/bin/bash

# Define colors
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to run a command and prefix its output
run_with_prefix() {
    local prefix=$1
    local color=$2
    shift 2
    "$@" 2>&1 | while IFS= read -r line; do
        echo -e "${color}${prefix} | ${line}${NC}"
    done
}

# Kill any process running on port 4200
echo "Checking for any process running on port 4200..."
PID=$(lsof -ti:4200)
if [ -n "$PID" ]; then
    echo "Killing process $PID running on port 4200..."
    kill -9 $PID
fi

start_services() {
    # Run Yggdrasil first
    (
        cd Yggdrasil
        run_with_prefix "Yggdrasil" "$PURPLE" npm run start
    ) &

    YGGDRASIL_PID=$!

    # Wait for 2 seconds before starting Sleipnir
    sleep 3

    # Run Sleipnir
    (
        cd Sleipnir
        run_with_prefix "Sleipnir" "$BLUE" ng serve
    ) &

    SLEIPNIR_PID=$!

    # Wait for either process to exit and log which one
    while true; do
        if ! kill -0 $YGGDRASIL_PID 2>/dev/null; then
            echo -e "${PURPLE}Yggdrasil has crashed.${NC}"
            break
        fi

        if ! kill -0 $SLEIPNIR_PID 2>/dev/null; then
            echo -e "${BLUE}Sleipnir has crashed.${NC}"
            break
        fi

        sleep 2
    done
}

while true; do
    echo "Starting services..."
    start_services
    echo "Restarting both services..."
    # Kill any remaining process
    kill $YGGDRASIL_PID $SLEIPNIR_PID 2>/dev/null
    # Give a short delay before restarting
    sleep 4
done
