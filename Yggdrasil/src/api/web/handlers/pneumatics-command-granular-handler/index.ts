import { PneumaticsSystemService, Valve } from 'domain/'
import { Handler } from '../handler'
import { webSocketConnections } from 'app/websocket/server/open-socket';
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller';
import { FrontendCommandGranularMessage, LegCommandGranular, PneumaticsCommandGranular } from 'domain/controllers/types';

 
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

class PneumaticsCommandGranularHandler implements Handler<PneumaticsCommandGranular> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}

    validate(data: unknown): FrontendCommandGranularMessage {
        if (!data) {
            throw new Error('Data is required');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object');
        }

        const cmd = data as Partial<FrontendCommandGranularMessage>; 

        if (cmd.type !== 'pneumaticsCommandGranular' || typeof cmd.sendTime !== 'string') {
            throw new Error('Missing or invalid required fields: type or sendTime');
        }
        if (!cmd.command || typeof cmd.command.assembly === 'undefined' || typeof cmd.command.valve === 'undefined' || typeof cmd.command.state === 'undefined') {
            throw new Error('Invalid command structure');
        }

        return cmd as FrontendCommandGranularMessage;
    }

    async handle(data: unknown): Promise<void> {
        console.log("Received data:", data);

        const validatedFrontendCommand = this.validate(data) as FrontendCommandGranularMessage;

        const pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance();
        const outgoingCommand = pneumaticsModelSingleton.model.handleCommandGranular(validatedFrontendCommand);
        const outgoingCommandStringified = JSON.stringify(outgoingCommand)

        console.log("Processed Command:", validatedFrontendCommand);

    if ('esp32' in webSocketConnections) {
        webSocketConnections['esp32'].send(outgoingCommandStringified);
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

export { PneumaticsCommandGranularHandler }
