import { PneumaticsSystemService, Valve } from 'domain/'
import { Handler } from '../handler'
import { webSocketConnections } from 'app/websocket/server/open-socket';
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller';
import { PneumaticsCommandPattern, PneumaticsCommandPatternMessage, isValidPneumaticsPattern } from 'domain/controllers/types';

 
class PneumaticsCommandPatternHandler implements Handler<PneumaticsCommandPatternMessage> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}

    validate(data: unknown): PneumaticsCommandPatternMessage {
        if (!data) {
            throw new Error('Data is required');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object');
        }

        const cmd = data as Partial<PneumaticsCommandPatternMessage>; 

        if (cmd.type !== 'pneumaticsCommandPattern' || typeof cmd.sendTime !== 'string') {
            throw new Error('Missing or invalid required fields: type or sendTime');
        }
        if (!isValidPneumaticsPattern(cmd.pattern!)) {
            throw new Error('Invalid pattern!');
        }

        return cmd as PneumaticsCommandPatternMessage;
    }



    async handle(data: unknown): Promise<void> {
        console.log("Received data:", data);

        const validatedFrontendCommand = this.validate(data) as PneumaticsCommandPatternMessage;

        const pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance();
        const outgoingCommand = pneumaticsModelSingleton.model.handleCommand(validatedFrontendCommand);
      
    }
}

export { PneumaticsCommandPatternHandler }
