import { PneumaticsSystemService, Valve } from 'domain/'
import { Handler } from '../handler'
import { webSocketConnections } from 'app/websocket/server/open-socket'
import {
    PneumaticsModelSingleton,
    PneumaticsPatternController,
} from 'domain/controllers/pneumatics-controller'
import {
    FrontendCommandGranularMessage,
    LegCommandGranular,
    PneumaticsCommandGranular,
    PneumaticsCommandGranularBowOrStern,
    PneumaticsCommandGranularCombined,
} from 'domain/controllers/types'

const sampleReadingsData = {
    bigAssMainTank: {
        pressurePsi: 12,
        compressorToTankValve: 'closed',
    },
    bowStarboard: {
        ballastPressurePsi: 101,
        pistonPressurePsi: 102,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    bowPort: {
        ballastPressurePsi: 103,
        pistonPressurePsi: 104,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    sternPort: {
        ballastPressurePsi: 6,
        pistonPressurePsi: 22,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    sternStarboard: {
        ballastPressurePsi: 8000,
        pistonPressurePsi: -12,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    sendTime: new Date().toLocaleString(),
}
// Serialize the object to a JSON string
const sampleReadingsDataString = JSON.stringify(sampleReadingsData)

class PneumaticsCommandGranularHandler
    implements Handler<PneumaticsCommandGranular>
{
    private pneumaticsModelSingleton: PneumaticsModelSingleton

    constructor(private pneumaticSystemService: PneumaticsSystemService) {
        this.pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance()
    }

    validate(data: unknown): FrontendCommandGranularMessage {
        if (!data) {
            throw new Error('Data is required')
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object')
        }

        const cmd = data as Partial<FrontendCommandGranularMessage>

        if (
            cmd.type !== 'pneumaticsCommandGranular' ||
            typeof cmd.sendTime !== 'string'
        ) {
            throw new Error(
                'Missing or invalid required fields: type or sendTime'
            )
        }
        if (
            !cmd.command ||
            typeof cmd.command.assembly === 'undefined' ||
            typeof cmd.command.valve === 'undefined' ||
            typeof cmd.command.state === 'undefined'
        ) {
            throw new Error('Invalid command structure')
        }

        return cmd as FrontendCommandGranularMessage
    }

    async handle(data: unknown): Promise<void> {
        // console.log("Received data:", data);

        // Stop any live patterns
        try {
            await this.pneumaticsModelSingleton.patternController.stopPattern()
        } catch (error) {
            console.error('Error running pattern:', error)
        }

        const validatedFrontendCommand = this.validate(
            data
        ) as FrontendCommandGranularMessage

        const outgoingCommand =
            this.pneumaticsModelSingleton.model.handleCommandGranular(
                validatedFrontendCommand
            )

        console.log('Processed Command:', validatedFrontendCommand)
    }

    createValve(
        valveName: keyof LegCommandGranular,
        state: Valve
    ): LegCommandGranular {
        // Using computed property names to return the correct key with a new Valve instance
        return {
            [valveName]: state as Valve,
        }
    }
}

export { PneumaticsCommandGranularHandler }
