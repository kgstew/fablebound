import { LegCommandGranular, PneumaticsCommandGranular } from "api/web/handlers/pneumatics-command-granular-handler/pneumatics-command-granular"
import { FrontendCommandGranularMessage, ReadingsData, SystemState, PneumaticsCommandText, PneumaticsCommandTextMessage } from "./types"
import { Valve } from "domain/models"


export const defaultSystemState: ReadingsData = {
    type: 'espToServerSystemState', //this is structurally part of the node app for parsing and sorting inputs
    bigAssMainTank: {
        pressurePsi: 0,
        compressorToTankValve: 'closed',
    },
    bowStarboard: {
        ballastPressurePsi: 0,
        pistonPressurePsi: 0,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    bowPort: {
        ballastPressurePsi: 0,
        pistonPressurePsi: 0,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    sternPort: {
        ballastPressurePsi: 0,
        pistonPressurePsi: 0,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    sternStarboard: {
        ballastPressurePsi: 0,
        pistonPressurePsi: 0,
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    },
    sendTime: new Date().toLocaleString(), // example output to replicate in C: `6/23/2024, 2:50:59 PM`
}

export class PneumaticsController {
    public systemState!: SystemState
    public systemStateLog: SystemState[] = []
    public logLength = 2400 // at 4 readings per second this is 10 minutes of readings data
    public command!: PneumaticsCommandGranular
    public bigAssMainTankMinPressure = 100
    public bigAssMainTankMaxPressure = 250
    public ballastTankMaxPressure = 100
    public maxPistonPressure = 100

    public valveCommandsLower = {
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'open',
    } as LegCommandGranular

    public valveCommandsRaise = {
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'open',
        pistonReleaseValve: 'closed',
    } as LegCommandGranular

    public constructor(
        systemStateReadings: ReadingsData = defaultSystemState
    ) {
        this.updateSystemStateFromReadings(systemStateReadings)
    }

    public dischargeCommand(): PneumaticsCommandGranular {
        const outgoingCommand = this.command
        this.command = {
            type: 'pneumaticsCommandGranular',
            sendTime: new Date().toLocaleString(),
        }
        return outgoingCommand
    }

    public updateSystemStateFromReadings(systemStateReadings: ReadingsData) {
        this.systemState = {
            bigAssMainTank: systemStateReadings.bigAssMainTank,
            bowStarboard: systemStateReadings.bowStarboard,
            bowPort: systemStateReadings.bowPort,
            sternPort: systemStateReadings.sternPort,
            sternStarboard: systemStateReadings.sternStarboard,
            lastReadingsReceived: new Date(systemStateReadings.sendTime),
        }
        this.updateSystemStateLogs()

        return this.systemState
    }

    private updateSystemStateLogs() {
        this.systemStateLog.push(this.systemState)
        if (this.systemStateLog.length > this.logLength) {
            this.systemStateLog.shift()
        }
    }

    public opportunisticBallastFill() {
        if (
            this.systemState.bigAssMainTank.pressurePsi >
            this.bigAssMainTankMinPressure
        ) {
            this.checkAndOpportunisticallyFillBallast('bowStarboard')
            this.checkAndOpportunisticallyFillBallast('bowPort')
            this.checkAndOpportunisticallyFillBallast('sternStarboard')
            this.checkAndOpportunisticallyFillBallast('sternPort')
        }
    }

    private checkAndOpportunisticallyFillBallast(
        legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'
    ) {
        if (
            this.command &&
            this.command[legAssembly] &&
            this.command[legAssembly]!.ballastToPistonValve === 'closed'
        ) {
            if (
                this.systemState[legAssembly].ballastPressurePsi <
                this.ballastTankMaxPressure
            ) {
                ;(this.command[legAssembly] ??= {}).ballastIntakeValve = 'open'
            }
        }
    }

    public preventOverfill() {
        this.preventOverfillForLegAssembly('bowStarboard')
        this.preventOverfillForLegAssembly('bowPort')
        this.preventOverfillForLegAssembly('sternStarboard')
        this.preventOverfillForLegAssembly('sternPort')
        this.preventOverfillForBigAssMainTank()
    }

    private preventOverfillForLegAssembly(
        legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'
    ) {
        if (
            this.systemState[legAssembly].pistonPressurePsi >
            this.maxPistonPressure
        ) {
            ;(this.command[legAssembly] ??= {}).ballastToPistonValve = 'closed'
        }
        if (
            this.systemState[legAssembly].ballastPressurePsi >
            this.ballastTankMaxPressure
        ) {
            ;(this.command[legAssembly] ??= {}).ballastIntakeValve = 'closed'
        }
    }

    private preventOverfillForBigAssMainTank() {
        if (
            this.systemState.bigAssMainTank.pressurePsi >
            this.bigAssMainTankMaxPressure
        ) {
            ;(this.command.bigAssMainTank ??= {}).compressorToTankValve =
                'closed'
        }
    }

    public handleCommandGranular(
        commandMessage: FrontendCommandGranularMessage
    ): PneumaticsCommandGranular {
        this.buildCommandGranular(commandMessage)
        this.opportunisticBallastFill()
        this.preventOverfill()
        return this.dischargeCommand()
    }

    public handleCommand(
        commandMessage: PneumaticsCommandTextMessage
    ): PneumaticsCommandGranular {
        this.buildCommand(commandMessage)
        this.opportunisticBallastFill()
        this.preventOverfill()
        return this.dischargeCommand()
    }

    public buildCommandGranular(
        frontendCommand: FrontendCommandGranularMessage
    ): PneumaticsCommandGranular {
        // Initialize the command structure based on the assembly and valve
        const assemblyCommand: LegCommandGranular = {
            [frontendCommand.command.valve]: frontendCommand.command
                .state as Valve, // Create a new valve with the specified state
        }

        // Create the complete PneumaticsCommandGranular object
        const pneumaticCommand: PneumaticsCommandGranular = {
            type: frontendCommand.type,
            [frontendCommand.command.assembly]: assemblyCommand,
            sendTime: new Date().toLocaleString(),
        }

        this.command = pneumaticCommand
        return this.command
    }

    public buildCommand(
        incomingCommandMessage: PneumaticsCommandTextMessage
    ): PneumaticsCommandGranular {
        this.command = {
            type: 'pneumaticsCommandGranular',
            sendTime: new Date().toLocaleString(),
        }

        switch (incomingCommandMessage.command) {
            case 'raiseBow':
                return this.commandRaiseBow()
            case 'lowerBow':
                return this.commandLowerBow()
            case 'raiseStern':
                return this.commandRaiseStern()
            case 'lowerStern':
                return this.commandLowerStern()
            case 'raiseStarboard':
                return this.commandRaiseStarboard()
            case 'lowerStarboard':
                return this.commandLowerStarboard()
            case 'raisePort':
                return this.commandRaisePort()
            case 'lowerPort':
                return this.commandLowerPort()
            case 'raiseBowStarboard':
                return this.commandRaiseBowStarboard()
            case 'lowerBowStarboard':
                return this.commandLowerBowStarboard()
            case 'raiseBowPort':
                return this.commandRaiseBowPort()
            case 'lowerBowPort':
                return this.commandLowerBowPort()
            case 'raiseSternStarboard':
                return this.commandRaiseSternStarboard()
            case 'lowerSternStarboard':
                return this.commandLowerSternStarboard()
            case 'raiseSternPort':
                return this.commandRaiseSternPort()
            case 'lowerSternPort':
                return this.commandLowerSternPort()
            case 'raiseStarboardAft':
                return this.commandRaiseStarboardAft()
            case 'lowerStarboardAft':
                return this.commandLowerStarboardAft()
            case 'raisePortAft':
                return this.commandRaisePortAft()
            case 'lowerPortAft':
                return this.commandLowerPortAft()
            case 'raiseStarboardBow':
                return this.commandRaiseStarboardBow()
            case 'lowerStarboardBow':
                return this.commandLowerStarboardBow()
            case 'raisePortBow':
                return this.commandRaisePortBow()
            case 'lowerPortBow':
                return this.commandLowerPortBow()
            default:
                throw new Error(`Unsupported command: ${incomingCommandMessage}`)
        }
    }

    private commandRaiseBow() {
        this.command.bowPort = this.valveCommandsRaise
        this.command.bowStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerBow() {
        this.command.bowPort = this.valveCommandsLower
        this.command.bowStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaiseStern() {
        this.command.sternPort = this.valveCommandsRaise
        this.command.sternStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerStern() {
        this.command.sternPort = this.valveCommandsLower
        this.command.sternStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaiseStarboard() {
        this.command.bowStarboard = this.valveCommandsRaise
        this.command.sternStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerStarboard() {
        this.command.bowStarboard = this.valveCommandsLower
        this.command.sternStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaisePort() {
        this.command.bowPort = this.valveCommandsRaise
        this.command.sternPort = this.valveCommandsRaise
        return this.command
    }

    private commandLowerPort() {
        this.command.bowPort = this.valveCommandsLower
        this.command.sternPort = this.valveCommandsLower
        return this.command
    }

    private commandRaiseBowStarboard() {
        this.command.bowStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerBowStarboard() {
        this.command.bowStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaiseBowPort() {
        this.command.bowPort = this.valveCommandsRaise
        return this.command
    }

    private commandLowerBowPort() {
        this.command.bowPort = this.valveCommandsLower
        return this.command
    }

    private commandRaiseSternStarboard() {
        this.command.sternStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerSternStarboard() {
        this.command.sternStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaiseSternPort() {
        this.command.sternPort = this.valveCommandsRaise
        return this.command
    }

    private commandLowerSternPort() {
        this.command.sternPort = this.valveCommandsLower
        return this.command
    }

    private commandRaiseStarboardAft() {
        this.command.sternStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerStarboardAft() {
        this.command.sternStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaisePortAft() {
        this.command.sternPort = this.valveCommandsRaise
        return this.command
    }

    private commandLowerPortAft() {
        this.command.sternPort = this.valveCommandsLower
        return this.command
    }

    private commandRaiseStarboardBow() {
        this.command.bowStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerStarboardBow() {
        this.command.bowStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaisePortBow() {
        this.command.bowPort = this.valveCommandsRaise
        return this.command
    }

    private commandLowerPortBow() {
        this.command.bowPort = this.valveCommandsLower
        return this.command
    }
}

export class PneumaticsModelSingleton {
    private static instance: PneumaticsModelSingleton;
    public model: PneumaticsController;

    private constructor() {
        this.model = new PneumaticsController();
    }

    public static getInstance(): PneumaticsModelSingleton {
        if (!PneumaticsModelSingleton.instance) {
            PneumaticsModelSingleton.instance = new PneumaticsModelSingleton();
        }
        return PneumaticsModelSingleton.instance;
    }
}