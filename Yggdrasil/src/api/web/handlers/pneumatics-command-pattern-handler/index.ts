import { PneumaticsSystemService } from 'domain/'
import { Handler } from '../handler'
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller'
import {
    PneumaticsCommandPatternMessage,
    isValidPneumaticsPattern,
} from 'domain/controllers/types'

class PneumaticsCommandPatternHandler
    implements Handler<PneumaticsCommandPatternMessage>
{
    private pneumaticsModelSingleton: PneumaticsModelSingleton

    constructor(private pneumaticSystemService: PneumaticsSystemService) {
        this.pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance()
    }
    validate(data: unknown): PneumaticsCommandPatternMessage {
        if (!data) {
            throw new Error('Data is required')
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object')
        }

        const cmd = data as Partial<PneumaticsCommandPatternMessage>

        if (
            cmd.type !== 'pneumaticsCommandPattern' ||
            typeof cmd.sendTime !== 'string'
        ) {
            throw new Error(
                'Missing or invalid required fields: type or sendTime'
            )
        }
        if (!isValidPneumaticsPattern(cmd.pattern!)) {
            throw new Error('Invalid pattern!')
        }

        return cmd as PneumaticsCommandPatternMessage
    }

    async handle(data: unknown): Promise<void> {
        // console.log("Received data:", data);

        const validatedCommand = this.validate(data)

        // Start the pattern
        try {
            await this.pneumaticsModelSingleton.patternController.setPattern(
                validatedCommand.pattern
            )
        } catch (error) {
            console.error('Error running pattern:', error)
        }
    }
}

export { PneumaticsCommandPatternHandler }
