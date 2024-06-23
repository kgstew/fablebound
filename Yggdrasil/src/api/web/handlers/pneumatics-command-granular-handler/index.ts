import { PneumaticsSystemService, Valve } from 'domain/'
import { Handler } from '../handler'
import { BigAssMainTankCommandGranular, LegCommandGranular, PneumaticsCommandGranular, } from './pneumatics-command-granular'
import { webSocketConnections } from 'app/websocket/server/open-socket';

 
const sampleReadingsData = {
    bigAssMainTank: {
        pressurePsi: 12,
        compressorToTankValve: "closed",
    },
    bowStarboard: 
        {
            ballastPressurePsi: 101,
            pistonPressurePsi: 102,
            ballastIntakeValve: "closed",
            ballastToPistonValve: "closed",
            pistonReleaseValve: "closed",
        },
    bowPort: 
        {
            ballastPressurePsi: 103,
            pistonPressurePsi: 104,
            ballastIntakeValve: "closed",
            ballastToPistonValve: "closed",
            pistonReleaseValve: "closed",
        },
    sternPort: 
        {
            ballastPressurePsi: 6,
            pistonPressurePsi: 22,
            ballastIntakeValve: "closed",
            ballastToPistonValve: "closed",
            pistonReleaseValve: "closed",
        },
    sternStarboard: 
        {
            ballastPressurePsi: 8000,
            pistonPressurePsi: -12,
            ballastIntakeValve: "closed",
            ballastToPistonValve: "closed",
            pistonReleaseValve: "closed",
        },
      sendTime: new Date().toLocaleString()
}
// Serialize the object to a JSON string
const sampleReadingsDataString = JSON.stringify(sampleReadingsData);

type CommandDetail = {
    assembly: keyof PneumaticsCommandGranular; // Refers to 'bowStarboard', 'bowPort', etc.
    valve: keyof LegCommandGranular | keyof BigAssMainTankCommandGranular; // Refers to 'ballastIntakeValve', 'ballastToPistonValve', etc.
    state: Valve;
};

type FrontendCommand = {
    type: "pneumaticsCommandGranular";
    command: CommandDetail;
    sendTime: string;
};

class PneumaticsCommandGranularHandler implements Handler<PneumaticsCommandGranular> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}

    validate(data: unknown): FrontendCommand {
        if (!data) {
            throw new Error('Data is required');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object');
        }

        const cmd = data as Partial<FrontendCommand>; // Use Partial to handle optional properties

        if (cmd.type !== 'pneumaticsCommandGranular' || typeof cmd.sendTime !== 'string') {
            throw new Error('Missing or invalid required fields: type or sendTime');
        }
        if (!cmd.command || typeof cmd.command.assembly === 'undefined' || typeof cmd.command.valve === 'undefined' || typeof cmd.command.state === 'undefined') {
            throw new Error('Invalid command structure');
        }

        return cmd as FrontendCommand;
    }

    async handle(data: unknown): Promise<void> {
        console.log("Received data:", data);

        const validatedData = this.validate(data);

        // Initialize the command structure based on the assembly and valve
        const assemblyCommand: LegCommandGranular = {
            [validatedData.command.valve]: validatedData.command.state as Valve // Create a new valve with the specified state
        };

        // Create the complete PneumaticsCommandGranular object
        const pneumaticCommand: PneumaticsCommandGranular = {
            type: validatedData.type,
            [validatedData.command.assembly]: assemblyCommand,
            sendTime: validatedData.sendTime
        };

        console.log("Processed Command:", pneumaticCommand);

    if ('esp32' in webSocketConnections) {
        webSocketConnections['esp32'].send(validatedData);
        console.log("Data sent to esp32.");
    } else {
        console.log("Failed to send data: 'esp32' connection does not exist.");
    }
    if ('frontend' in webSocketConnections) {
        webSocketConnections['frontend'].send(sampleReadingsDataString);
        console.log("Sample data sent to frontend.");
    } else {
        console.log("Dang man we're not connected to the frontend either??? wtf")
    }
    }

    createValve(valveName: keyof LegCommandGranular, state: Valve): LegCommandGranular {
        // Using computed property names to return the correct key with a new Valve instance
        return {
            [valveName]: state as Valve
        };
    }
}

export { PneumaticsCommandGranularHandler as PneumaticsCommandHandler }
