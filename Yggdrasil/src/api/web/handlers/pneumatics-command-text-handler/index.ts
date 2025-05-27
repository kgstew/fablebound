import { PneumaticsSystemService, Valve } from 'domain/'
import { Handler } from '../handler'
import { webSocketConnections } from 'app/websocket/server/open-socket'
import {
    PneumaticsModelSingleton,
    PneumaticsPatternController,
} from 'domain/controllers/pneumatics-controller'
import {
    PneumaticsCommandText,
    PneumaticsCommandTextMessage,
    isValidPneumaticsCommand,
} from 'domain/controllers/types'

class PneumaticsCommandTextHandler
    implements Handler<PneumaticsCommandTextMessage>
{
    private pneumaticsModelSingleton: PneumaticsModelSingleton

    constructor(private pneumaticSystemService: PneumaticsSystemService) {
        this.pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance()
    }

    validate(data: unknown): PneumaticsCommandTextMessage {
        if (!data) {
            throw new Error('Data is required')
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object')
        }

        const cmd = data as Partial<PneumaticsCommandTextMessage>

        if (
            cmd.type !== 'pneumaticsCommandText' ||
            typeof cmd.sendTime !== 'string'
        ) {
            throw new Error(
                'Missing or invalid required fields: type or sendTime'
            )
        }
        if (!isValidPneumaticsCommand(cmd.command!)) {
            throw new Error('Invalid command!')
        }

        return cmd as PneumaticsCommandTextMessage
    }

    async handle(data: unknown): Promise<void> {
        //  console.log("Received data:", data);
        // Stop any live patterns
        try {
            await this.pneumaticsModelSingleton.patternController.stopPattern()
        } catch (error) {
            console.error('Error running pattern:', error)
        }
        const validatedFrontendCommand = this.validate(
            data
        ) as PneumaticsCommandTextMessage

        const outgoingCommand =
            this.pneumaticsModelSingleton.model.handleCommand(
                validatedFrontendCommand
            )

        console.log('Processed Command:', validatedFrontendCommand)
    }
}

export { PneumaticsCommandTextHandler }
