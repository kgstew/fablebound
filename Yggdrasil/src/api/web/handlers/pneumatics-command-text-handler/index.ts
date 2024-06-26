import { PneumaticsSystemService, Valve } from 'domain/'
import { Handler } from '../handler'
import { webSocketConnections } from 'app/websocket/server/open-socket';
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller';
import { PneumaticsCommandText, PneumaticsCommandTextMessage, isValidPneumaticsCommand } from 'domain/controllers/types';

 
class PneumaticsCommandTextHandler implements Handler<PneumaticsCommandTextMessage> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}

    validate(data: unknown): PneumaticsCommandTextMessage {
        if (!data) {
            throw new Error('Data is required');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object');
        }

        const cmd = data as Partial<PneumaticsCommandTextMessage>; 

        if (cmd.type !== 'pneumaticsCommandText' || typeof cmd.sendTime !== 'string') {
            throw new Error('Missing or invalid required fields: type or sendTime');
        }
        if (!isValidPneumaticsCommand(cmd.command!)) {
            throw new Error('Invalid command!');
        }

        return cmd as PneumaticsCommandTextMessage;
    }



    async handle(data: unknown): Promise<void> {
        console.log("Received data:", data);

        const validatedFrontendCommand = this.validate(data) as PneumaticsCommandTextMessage;

        const pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance();
        const outgoingCommand = pneumaticsModelSingleton.model.handleCommand(validatedFrontendCommand);
        const outgoingCommandStringified = JSON.stringify(outgoingCommand)

        console.log("Processed Command:", validatedFrontendCommand);

    if ('esp32' in webSocketConnections) {
        webSocketConnections['esp32'].send(outgoingCommandStringified);
        console.log("Data sent to esp32.");
    } else {
        console.log("Failed to send data: 'esp32' connection does not exist.");
    }
    }
}

export { PneumaticsCommandTextHandler }
