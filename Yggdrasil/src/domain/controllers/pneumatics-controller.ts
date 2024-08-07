import { LegCommandGranular, PneumaticsCommandGranular, PneumaticsCommandGranularBowOrStern as PneumaticsCommandGranularBowOrStern, PneumaticsCommandGranularCombined } from "api/web/handlers/pneumatics-command-granular-handler/pneumatics-command-granular"
import { FrontendCommandGranularMessage, ReadingsData, SystemState, PneumaticsCommandText, PneumaticsCommandTextMessage, BowOrSternReadingsData, PneumaticsCommandPattern, PneumaticsCommandPatternName, PneumaticsCommandPatternMap, PressureSettings } from "./types"
import { Valve } from "domain/models"
import { PneumaticsCommandGranularHandler } from "api"
import { webSocketConnections } from "app/websocket/server/open-socket"
import { randomInt } from "crypto"


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
    private lastCommand: PneumaticsCommandText = 'none';
    private maintenanceInterval: NodeJS.Timeout | null = null;

    public ballastTankMaxPressure!: number
    public maxPistonPressure!: number
    public minPistonPressure!: number
    private pressureTargets: Map<string, number> = new Map();

    public defaultPressureSettings: PressureSettings = {
        ballastTankMaxPressure: 40,
        maxPistonPressure: 35,
        minPistonPressure: 10,
    }

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

    public valveCommandsHold = {
        ballastIntakeValve: 'open',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    } as LegCommandGranular

    public valveCommandsVent = {
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'open',
        pistonReleaseValve: 'open',
    } as LegCommandGranular
    
    public valveCommandsCloseAll = {
        ballastIntakeValve: 'closed',
        ballastToPistonValve: 'closed',
        pistonReleaseValve: 'closed',
    } as LegCommandGranular
    

    public constructor(
        systemStateReadings: ReadingsData = defaultSystemState
    ) {
        this.restoreDefaultPressureSettings()    
        this.initializeSystemState(systemStateReadings)    
        this.startBaselineMaintain();
    }

    private startBaselineMaintain() {
        this.maintenanceInterval = setInterval(() => {
            try {
                this.maintainBaseline();
            } catch (e) {
                console.error(e)
                console.error('Error in maintainBaseline');
            }
        }, 200); // Run every 200ms (5 times per second)
    }


    public updatePressureSettings(settings: Partial<PressureSettings>): void {
        if (settings.ballastTankMaxPressure !== undefined) {
            this.ballastTankMaxPressure = settings.ballastTankMaxPressure;
        }
        if (settings.maxPistonPressure !== undefined) {
            this.maxPistonPressure = settings.maxPistonPressure;
        }
        if (settings.minPistonPressure !== undefined) {
            this.minPistonPressure = settings.minPistonPressure;
        }

        console.log('Pressure settings updated:', {
            ballastTankMaxPressure: this.ballastTankMaxPressure,
            maxPistonPressure: this.maxPistonPressure,
            minPistonPressure: this.minPistonPressure
        });
    }

    public restoreDefaultPressureSettings(): void {
        this.updatePressureSettings(this.defaultPressureSettings);
    }

    
    public setPressureTarget(
        legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard',
        targetPressure: number,
        unit: 'psi' | 'percent'
    ): void {
        let actualTargetPressure: number;

        if (unit === 'percent') {
            if (targetPressure < 0 || targetPressure > 100) {
                console.warn(`Invalid percentage ${targetPressure}%. Must be between 0 and 100. Ignoring.`);
                return;
            }
            actualTargetPressure = this.minPistonPressure + (targetPressure / 100) * (this.maxPistonPressure - this.minPistonPressure);
        } else {
            actualTargetPressure = targetPressure;
        }

        if (actualTargetPressure < this.minPistonPressure || actualTargetPressure > this.maxPistonPressure) {
            console.warn(`Target pressure ${actualTargetPressure} PSI is out of bounds (${this.minPistonPressure}-${this.maxPistonPressure} PSI). Ignoring.`);
            return;
        }

        console.log(`Setting pressure set point for ${legAssembly} to ${actualTargetPressure} PSI`);
        this.pressureTargets.set(legAssembly, actualTargetPressure);
    }

    public clearPressureTarget(legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'): void {
        this.pressureTargets.delete(legAssembly);
        console.log(`Cleared pressure set point for ${legAssembly}`);
    }

    public clearAllPressureTargets(): void {
        this.pressureTargets.clear();
        console.log("Cleared all pressure set points");
    }
    
    public updatePressureTargets(): void {
        for (const [legAssembly, targetPressure] of this.pressureTargets.entries()) {
            const pistonPressure = this.systemState[legAssembly].pistonPressurePsi;
            const ballastPressure = this.systemState[legAssembly].ballastPressurePsi;
            
            if (Math.abs(pistonPressure - targetPressure) <= 1) {
                console.log(`Target pressure reached for ${legAssembly}`);
                this.command[legAssembly] = this.valveCommandsHold;
                this.clearPressureTarget(legAssembly as any);
                continue;
            }
            if (pistonPressure < targetPressure && ballastPressure > pistonPressure) {
                this.command[legAssembly] = this.valveCommandsRaise;
            } else if (pistonPressure > targetPressure) {
                this.command[legAssembly] = this.valveCommandsLower;
            } else {
                // Can't raise piston pressure due to insufficient ballast pressure
                console.log(`Insufficient ballast pressure for ${legAssembly}`);
                this.command[legAssembly] = this.valveCommandsHold;
            }
        }
    }
    
    private maintainBaseline() {
        if (!this.systemState) {
            console.log("System state not initialized. Skipping baseline maintenance.");
            return;
        }
        if (this.lastCommand !== 'ventAll' && this.lastCommand !== 'closeAllValves') {
            this.updatePressureTargets();
            this.preventOverfill();
            this.keepPistonsALilFull();
            this.opportunisticBallastFill();
            // Discharge the command if any changes were made
            if (this.command && Object.keys(this.command).length > 2) { // Check if command has more than just type and sendTime
                this.dischargeCommand();
            }
        }
    }

    public dischargeCommand(): PneumaticsCommandGranularCombined {
        const outgoingCommand = this.splitOutgoingCommand()
        if ('esp32bow' in webSocketConnections) {
            webSocketConnections['esp32bow'].send(JSON.stringify(outgoingCommand.bow));
            console.log("Data sent to esp32.");
        } else {
            console.log("Failed to send data: 'esp32' connection does not exist.");
        }
        if ('esp32stern' in webSocketConnections) {
            webSocketConnections['esp32stern'].send(JSON.stringify(outgoingCommand.stern));
            console.log("Data sent to esp32.");
        } else {
            console.log("Failed to send data: 'esp32' connection does not exist.");
        }
        this.command = {
            type: 'pneumaticsCommandGranular',
            sendTime: new Date().toLocaleString(),
        }
        return outgoingCommand
    }

    public splitOutgoingCommand(): PneumaticsCommandGranularCombined {
        const outgoingCommandBow: PneumaticsCommandGranularBowOrStern = {
            type: 'pneumaticsCommandGranular',
            starboard: this.command.bowStarboard,
            port: this.command.bowPort,
            sendTime: this.command.sendTime,
        }
        const outgoingCommandStern: PneumaticsCommandGranularBowOrStern = {
            type: 'pneumaticsCommandGranular',
            starboard: this.command.sternStarboard,
            port: this.command.sternPort,
            sendTime: this.command.sendTime,
        }
        const combinedOutgoingCommand: PneumaticsCommandGranularCombined = {
            bow: outgoingCommandBow,
            stern: outgoingCommandStern,
        }
        return combinedOutgoingCommand
    }

    public initializeSystemState(systemStateReadings: ReadingsData) {
        this.systemState = {
            bigAssMainTank: systemStateReadings.bigAssMainTank,
            bowStarboard: systemStateReadings.bowStarboard,
            bowPort: systemStateReadings.bowPort,
            sternPort: systemStateReadings.sternPort,
            sternStarboard: systemStateReadings.sternStarboard,
            lastReadingsReceived: new Date(systemStateReadings.sendTime),
        }
        this.updateSystemStateLogs
    }

    public updateSystemStateFromReadings(systemStateReadings: BowOrSternReadingsData) {
        if (systemStateReadings.type == 'espToServerSystemStateBow') {
            this.systemState.bowStarboard = systemStateReadings.starboard
            this.systemState.bowPort = systemStateReadings.port
        } else if (systemStateReadings.type == 'espToServerSystemStateStern') {
            this.systemState.sternStarboard = systemStateReadings.starboard
            this.systemState.sternPort = systemStateReadings.port
        }
        this.systemState.lastReadingsReceived = new Date(systemStateReadings.sendTime)
        console.log("SYSTEM STATE")
        console.log(this.systemState)
        console.log("END SYSTEM STATE")
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
        this.checkAndOpportunisticallyFillBallast('bowStarboard')
        this.checkAndOpportunisticallyFillBallast('bowPort')
        this.checkAndOpportunisticallyFillBallast('sternStarboard')
        this.checkAndOpportunisticallyFillBallast('sternPort')
    }

    private checkAndOpportunisticallyFillBallast(
        legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'
    ) {
        // Ensure this.command is initialized
        this.command = this.command || {
            type: 'pneumaticsCommandGranular',
            sendTime: new Date().toLocaleString()
        };
    
        const legCommandEmpty = !this.command[legAssembly] || Object.keys(this.command[legAssembly]).length === 0;
        const pistonValveClosed = 
            (this.command[legAssembly]?.ballastToPistonValve === 'closed') || 
            (legCommandEmpty && this.systemState[legAssembly]?.ballastToPistonValve === 'closed');
    
        if (pistonValveClosed) {
            const currentPressure = this.systemState[legAssembly]?.ballastPressurePsi;
            if (currentPressure !== undefined && this.ballastTankMaxPressure !== undefined) {
                if (currentPressure < this.ballastTankMaxPressure) {
                    this.command[legAssembly] = {
                        ...this.command[legAssembly],
                        ballastIntakeValve: 'open'
                    };
                    console.log(`Opportunistically filling ballast for ${legAssembly}. Current pressure: ${currentPressure}, Max pressure: ${this.ballastTankMaxPressure}`);
                } else {
                    console.log(`Not filling ballast for ${legAssembly}. Current pressure (${currentPressure}) not below max (${this.ballastTankMaxPressure})`);
                }
            } else {
                console.log(`Skipping ballast fill for ${legAssembly}. Pressure data unavailable.`);
            }
        } else {
            console.log(`Not filling ballast for ${legAssembly}. Piston valve is not closed or there's an existing command.`);
        }
    }
    
    

    public preventOverfill() {
        this.preventOverfillForLegAssembly('bowStarboard')
        this.preventOverfillForLegAssembly('bowPort')
        this.preventOverfillForLegAssembly('sternStarboard')
        this.preventOverfillForLegAssembly('sternPort')
    }


    private holdMinPistonPressureForLegAssembly(
        legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'
    ) {
        if (
            this.systemState[legAssembly].pistonPressurePsi < this.minPistonPressure && 
            this.systemState[legAssembly].pistonPressurePsi < this.systemState[legAssembly].ballastPressurePsi
        ) {
            this.setPressureTarget(legAssembly, this.minPistonPressure+2, 'psi')
        }
    }

    public keepPistonsALilFull() {
        this.holdMinPistonPressureForLegAssembly('bowStarboard')
        this.holdMinPistonPressureForLegAssembly('bowPort')
        this.holdMinPistonPressureForLegAssembly('sternStarboard')
        this.holdMinPistonPressureForLegAssembly('sternPort')
    }

    private preventOverfillForLegAssembly(
        legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'
    ) {
        if (
            this.systemState[legAssembly].pistonPressurePsi >=
            this.maxPistonPressure
        ) {
            (this.command[legAssembly] ??= {}).ballastToPistonValve = 'closed'
        }
        if (
            this.systemState[legAssembly].ballastPressurePsi >=
            this.ballastTankMaxPressure
        ) {
            (this.command[legAssembly] ??= {}).ballastIntakeValve = 'closed'
        }
    }


    public handleCommandGranular(
        commandMessage: FrontendCommandGranularMessage
    ): PneumaticsCommandGranular {
        this.lastCommand = "none"
        this.buildCommandGranular(commandMessage)
        this.opportunisticBallastFill()
        this.preventOverfill()
        return this.dischargeCommand()
    }

    public handleCommand(
        commandMessage: PneumaticsCommandTextMessage
    ): PneumaticsCommandGranular {        
        this.lastCommand = commandMessage.command;
        this.buildCommand(commandMessage)
        if (commandMessage.command != 'ventAll' && commandMessage.command != 'closeAllValves') {
            this.opportunisticBallastFill()
           // this.keepPistonsALilFull()
        }
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
            case 'holdBow':
                return this.commandHoldBow()
            case 'raiseStern':
                return this.commandRaiseStern()
            case 'lowerStern':
                return this.commandLowerStern()
            case 'holdStern':
                return this.commandHoldStern()
            case 'raiseStarboard':
                return this.commandRaiseStarboard()
            case 'lowerStarboard':
                return this.commandLowerStarboard()
            case 'holdStarboard':
                return this.commandHoldStarboard()
            case 'raisePort':
                return this.commandRaisePort()
            case 'lowerPort':
                return this.commandLowerPort()
            case 'holdPort':
                return this.commandHoldPort()
            case 'raiseBowStarboard':
                return this.commandRaiseBowStarboard()
            case 'lowerBowStarboard':
                return this.commandLowerBowStarboard()
            case 'holdBowStarboard':
                return this.commandHoldBowStarboard()
            case 'raiseBowPort':
                return this.commandRaiseBowPort()
            case 'lowerBowPort':
                return this.commandLowerBowPort()
            case 'holdBowPort':
                return this.commandHoldBowPort()
            case 'raiseSternStarboard':
                return this.commandRaiseSternStarboard()
            case 'lowerSternStarboard':
                return this.commandLowerSternStarboard()
            case 'holdSternStarboard':
                return this.commandHoldSternStarboard()
            case 'raiseSternPort':
                return this.commandRaiseSternPort()
            case 'lowerSternPort':
                return this.commandLowerSternPort()
            case 'holdSternPort':
                return this.commandHoldSternPort()
            case 'raiseStarboardStern':
                return this.commandRaiseStarboardStern()
            case 'lowerStarboardStern':
                return this.commandLowerStarboardStern()
            case 'holdStarboardStern':
                return this.commandHoldStarboardStern()
            case 'raisePortStern':
                return this.commandRaisePortStern()
            case 'lowerPortStern':
                return this.commandLowerPortStern()
            case 'holdPortStern':
                return this.commandHoldPortStern()
            case 'raiseStarboardBow':
                return this.commandRaiseStarboardBow()
            case 'lowerStarboardBow':
                return this.commandLowerStarboardBow()
            case 'holdStarboardBow':
                return this.commandHoldStarboardBow()
            case 'raisePortBow':
                return this.commandRaisePortBow()
            case 'lowerPortBow':
                return this.commandLowerPortBow()
            case 'holdPortBow':
                return this.commandHoldPortBow()
            case 'holdPosition':
                return this.commandHoldPosition()
            case 'ventAll':
                return this.commandVentAll()
            case 'closeAllValves':
                    return this.commandCloseAllValves()
            case 'none':
                    return this.commandNone()
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

    private commandRaiseStarboardStern() {
        this.command.sternStarboard = this.valveCommandsRaise
        return this.command
    }

    private commandLowerStarboardStern() {
        this.command.sternStarboard = this.valveCommandsLower
        return this.command
    }

    private commandRaisePortStern() {
        this.command.sternPort = this.valveCommandsRaise
        return this.command
    }

    private commandLowerPortStern() {
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

    private commandHoldPosition() {
        this.command.bowPort = this.valveCommandsHold
        this.command.bowStarboard = this.valveCommandsHold
        this.command.sternPort = this.valveCommandsHold
        this.command.sternStarboard = this.valveCommandsHold
    }
    private commandHoldBow() {
        this.command.bowPort = this.valveCommandsHold
        this.command.bowStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldStern() {
        this.command.sternPort = this.valveCommandsHold
        this.command.sternStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldStarboard() {
        this.command.bowStarboard = this.valveCommandsHold
        this.command.sternStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldPort() {
        this.command.bowPort = this.valveCommandsHold
        this.command.sternPort = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldBowStarboard() {
        this.command.bowStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldBowPort() {
        this.command.bowPort = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldSternStarboard() {
        this.command.sternStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldSternPort() {
        this.command.sternPort = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldStarboardStern() {
        this.command.sternStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldPortStern() {
        this.command.sternPort = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldStarboardBow() {
        this.command.bowStarboard = this.valveCommandsHold
        return this.command
    }
    
    private commandHoldPortBow() {
        this.command.bowPort = this.valveCommandsHold
        return this.command
    }
    
    private commandVentAll() {
        this.command.bowPort = this.valveCommandsVent
        this.command.bowStarboard = this.valveCommandsVent
        this.command.sternPort = this.valveCommandsVent
        this.command.sternStarboard = this.valveCommandsVent
    }

    private commandCloseAllValves() {
        this.command.bowPort = this.valveCommandsCloseAll
        this.command.bowStarboard = this.valveCommandsCloseAll
        this.command.sternPort = this.valveCommandsCloseAll
        this.command.sternStarboard = this.valveCommandsCloseAll
    }

    private commandNone() {}
}

export class PneumaticsPatternController {
    private pneumaticsController: PneumaticsController;
    private currentPattern: PneumaticsCommandPattern | null = null;
    private patterns: PneumaticsCommandPatternMap = new Map();
    private isRunning: boolean = false;
    private stopRequested: boolean = false;
    private patternSwitchRequested: boolean = false;
    private currentPatternExecution: Promise<void> | null = null;


    constructor(pneumaticsController: PneumaticsController) {
        this.pneumaticsController = pneumaticsController;
        this.initializePatterns();
    }

    private initializePatterns() {
        this.patterns.set("inPort", {
            name: "inPort",
            pressureSettings: {
                ballastTankMaxPressure: 25,
                maxPistonPressure: 18,
                minPistonPressure: 14,
            },
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 70, 'percent');
                await controller.setPressureTarget('sternStarboard', 70, 'percent');
                await controller.setPressureTarget('bowPort', 30, 'percent');
                await controller.setPressureTarget('sternPort', 30, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(2400,6000)));                
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 30, 'percent');
                await controller.setPressureTarget('sternStarboard', 30, 'percent');
                await controller.setPressureTarget('bowPort', 70, 'percent');
                await controller.setPressureTarget('sternPort', 70, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(2400,6000)));
                if (this.stopRequested) return;
            }
        });
        this.patterns.set("setOutOnAdventure", {
            name: "setOutOnAdventure",
            pressureSettings: {
                ballastTankMaxPressure: 35,
                maxPistonPressure: 20,
                minPistonPressure: 15,
            },
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 70, 'percent');
                await controller.setPressureTarget('bowPort', 70, 'percent');
                await controller.setPressureTarget('sternStarboard', 30, 'percent');
                await controller.setPressureTarget('sternPort', 30, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(1200,2200)));                
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 30, 'percent');
                await controller.setPressureTarget('bowPort', 30, 'percent');
                await controller.setPressureTarget('sternStarboard', 40, 'percent');
                await controller.setPressureTarget('sternPort', 40, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(800,1500)));
                if (this.stopRequested) return;
            }
        });
        this.patterns.set("intoTheUnknown", {
            name: "intoTheUnknown",
            pressureSettings: {
                ballastTankMaxPressure: 45,
                maxPistonPressure: 23,
                minPistonPressure: 15,
            },
            main: async (controller) => {
                await controller.setPressureTarget('bowStarboard', 90, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(400,600)));                
                if (this.stopRequested) return;

                // Raise port bow slightly and starboard stern
                await controller.setPressureTarget('bowPort', 60, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(125,175)));                
                if (this.stopRequested) return;
                await controller.setPressureTarget('sternStarboard', 70, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(400,600)));                
                if (this.stopRequested) return;

                // Lower starboard bow, raise port stern
                await controller.setPressureTarget('bowStarboard', 30, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(50,150)));     
                await controller.setPressureTarget('sternPort', 80, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(600,800)));                
                if (this.stopRequested) return;

                // Lower port bow and starboard stern
                await controller.setPressureTarget('bowPort', 20, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(50,150)));     
                await controller.setPressureTarget('sternStarboard', 20, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(400,600)));                
                if (this.stopRequested) return;

                // Lower port stern
                await controller.setPressureTarget('sternPort', 20, 'percent');
                await new Promise(resolve => setTimeout(resolve, randomInt(400,1200)));                
                if (this.stopRequested) return;
            }
        });
        this.patterns.set("risingStorm", {
            name: "risingStorm",
            pressureSettings: {
                ballastTankMaxPressure: 45,
                maxPistonPressure: 26,
                minPistonPressure: 16,
            },
            main: async (controller) => {
                const startTime = Date.now();
                const duration = 120000; // 120 seconds
                const initialDelay = 1000; // 1 second between waves initially
                const minDelay = 200; // Minimum delay between waves at peak intensity

                const randomSide = () => Math.random() < 0.5 ? 'port' : 'starboard';
                const getIntensity = (elapsed: number) => Math.min(1, elapsed / duration);

                while (!this.stopRequested) {
                    const elapsed = Date.now() - startTime;
                    const intensity = getIntensity(elapsed);
                    const side = randomSide();

                    // Calculate delay based on intensity
                    const delay = initialDelay - (initialDelay - minDelay) * intensity;

                    // Calculate pressure variations based on intensity
                    const maxPressure = 60 + Math.floor(intensity * 40); // 60% to 100%
                    const minPressure = 20 - Math.floor(intensity * 15); // 20% to 5%

                    if (side === 'starboard') {
                        await this.starboardWave(controller, maxPressure, minPressure, intensity);
                    } else {
                        await this.portWave(controller, maxPressure, minPressure, intensity);
                    }

                    if (this.stopRequested) return;
                    await new Promise(resolve => setTimeout(resolve, randomInt(delay * 0.8, delay * 1.2)));
                }
            }
        });
        this.patterns.set("stormySeas", {
            name: "stormySeas",
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 30,
                minPistonPressure: 15,
            },
            main: async (controller) => {
                const startTime = Date.now();
                const duration = 120000; // 120 seconds
                const cycleTime = 10000; // 10 seconds per full cycle
                let isPortSide = true; // Start with port side
                const safetyMargin = 10000; // 5 seconds safety margin

                while (!this.stopRequested && Date.now() - startTime < duration - safetyMargin) {
                    const elapsed = Date.now() - startTime;
                    const cycleElapsed = elapsed % cycleTime;
                    const intensity = Math.min(1, elapsed / duration);
                    const highIntensityRiseCutoff = randomInt(1800, 2200);
                    const holdHighPointCutoff = randomInt(2800, 3200);
                    const highIntensityFallCutoff = randomInt(4700, 5300);

                    // High-intensity rise
                    if (cycleElapsed < highIntensityRiseCutoff) {
                        await this.highIntensityRise(controller, isPortSide, intensity);
                    } 
                    // Hold at high point
                    else if (cycleElapsed < holdHighPointCutoff) {
                        await this.holdHighPoint(controller, isPortSide, intensity);
                    }
                    // High-intensity fall
                    else if (cycleElapsed < highIntensityFallCutoff) {
                        await this.highIntensityFall(controller, isPortSide, intensity);
                    }
                    // Regular wave patterns
                    else {
                        const waveStart = Date.now();
                        const remainingTime = duration - safetyMargin - (waveStart - startTime);
                        if (remainingTime <= 0) break;

                        const waveDuration = isPortSide
                            ? await this.portWave(controller, 90, 10, intensity)
                            : await this.starboardWave(controller, 90, 10, intensity);

                        if (Date.now() - waveStart > remainingTime) break;
                    }

                    // Switch sides at the end of each cycle
                    if (cycleElapsed >= cycleTime - 100) {
                        isPortSide = !isPortSide;
                    }

                    if (this.stopRequested) return;
                    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to prevent excessive CPU usage
                }

                // Finish with all pistons at lowest point
                await this.allPistonsToLowestPoint(controller);
            }
        });
        this.patterns.set("meetTheGods", {
            name: "meetTheGods",
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 32,
                minPistonPressure: 18,
            },
            main: async (controller) => {
                let initialSequenceCompleted = false;

                while (!this.stopRequested) {
                    if (!initialSequenceCompleted) {
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Raise bow
                        await controller.setPressureTarget('bowStarboard', 30, 'psi');
                        await controller.setPressureTarget('bowPort', 30, 'psi');    
                        await controller.setPressureTarget('sternPort', 20, 'psi');
                        await controller.setPressureTarget('sternStarboard', 20, 'psi');                    
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Raise stern

                        await controller.setPressureTarget('bowStarboard', 30, 'psi');
                        await controller.setPressureTarget('bowPort', 30, 'psi');
                        await controller.setPressureTarget('sternPort', 30, 'psi');
                        await controller.setPressureTarget('sternStarboard', 30, 'psi');                       
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        initialSequenceCompleted = true;
                    }

                    // Set and maintain pressure at 30 PSI for all legs
                    await controller.setPressureTarget('bowStarboard', 30, 'psi');
                    await controller.setPressureTarget('bowPort', 30, 'psi');
                    await controller.setPressureTarget('sternPort', 30, 'psi');
                    await controller.setPressureTarget('sternStarboard', 30, 'psi');

                    // Wait for a short interval before checking again
                    if (this.stopRequested) return;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        });
        this.patterns.set("trickstersPromise", {
            name: "trickstersPromise",
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 30,
                minPistonPressure: 18,
            },
            main: async (controller) => {
                const startTime = Date.now();
                const duration = 180000; // 120 seconds
                const cycleTime = 10000; // 10 seconds per full cycle
                const safetyMargin = 8000; // 5 seconds safety margin

                while (!this.stopRequested && Date.now() - startTime < duration - safetyMargin) {
                    const elapsed = Date.now() - startTime;
                    const cycleElapsed = elapsed % cycleTime;
                    
                    await controller.setPressureTarget('bowStarboard', 70, 'percent');
                    await controller.setPressureTarget('bowPort', 70, 'percent');
                    await controller.setPressureTarget('sternPort', 70, 'percent');
                    await controller.setPressureTarget('sternStarboard', 70, 'percent');                    
                    if (this.stopRequested) return;
                    await new Promise(resolve => setTimeout(resolve, randomInt(400,700)));

                    const randomSelection = randomInt(0, 2);

                    // front to back
                    if (randomSelection === 0) {
                        await controller.setPressureTarget('bowStarboard', 80, 'percent');
                        await controller.setPressureTarget('bowPort', 80, 'percent');
                        await controller.setPressureTarget('sternPort', 60, 'percent');
                        await controller.setPressureTarget('sternStarboard', 60, 'percent');                  
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, randomInt(800,1200)));
                        await controller.setPressureTarget('bowStarboard', 60, 'percent');
                        await controller.setPressureTarget('bowPort', 60, 'percent');
                        await controller.setPressureTarget('sternPort', 80, 'percent');
                        await controller.setPressureTarget('sternStarboard', 80, 'percent');                  
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, randomInt(800,1200)));
                    } 
                    // side to side
                    else if (randomSelection === 1) {
                        await controller.setPressureTarget('bowStarboard', 80, 'percent');
                        await controller.setPressureTarget('bowPort', 60, 'percent');
                        await controller.setPressureTarget('sternPort', 60, 'percent');
                        await controller.setPressureTarget('sternStarboard', 80, 'percent');                  
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, randomInt(800,1200)));
                        await controller.setPressureTarget('bowStarboard', 60, 'percent');
                        await controller.setPressureTarget('bowPort', 80, 'percent');
                        await controller.setPressureTarget('sternPort', 80, 'percent');
                        await controller.setPressureTarget('sternStarboard', 60, 'percent');                  
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, randomInt(800,1200)));

                    }
                    // High-intensity fall
                    else if (randomSelection === 2) {
                        await controller.setPressureTarget('bowStarboard', 50, 'percent');
                        await controller.setPressureTarget('bowPort', 50, 'percent');
                        await controller.setPressureTarget('sternPort', 50, 'percent');
                        await controller.setPressureTarget('sternStarboard', 50, 'percent');                  
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, randomInt(800,1200)));
                        await controller.setPressureTarget('bowStarboard', 80, 'percent');
                        await controller.setPressureTarget('bowPort', 80, 'percent');
                        await controller.setPressureTarget('sternPort', 80, 'percent');
                        await controller.setPressureTarget('sternStarboard', 80, 'percent');                  
                        if (this.stopRequested) return;
                        await new Promise(resolve => setTimeout(resolve, randomInt(800,1200)));
                    }

                    if (this.stopRequested) return;
                    await new Promise(resolve => setTimeout(resolve, randomInt(800,1200))); // Small delay to prevent excessive CPU usage
                }

                // Finish with all pistons at lowest point
                await this.allPistonsToHighestPoint(controller);
            }
        });
        this.patterns.set("arrivingHome", {
            name: "arrivingHome",
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 30,
                minPistonPressure: 15,
            },
            main: async (controller) => {
                // Finish with all pistons at lowest point
                await this.allPistonsToLowestPoint(controller);   
                if (this.stopRequested) return;                 
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to prevent excessive CPU usage
                await this.allPistonsToHighestPoint(controller);
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to prevent excessive CPU usage
            }
        });
        this.patterns.set("upDownUpDown", {
            name: "upDownUpDown",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseBow', sendTime: new Date().toLocaleString() });
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseStern', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerBow', sendTime: new Date().toLocaleString() });
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerStern', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("ventEverything", {
            name: "ventEverything",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'ventAll', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("closeAllValves", {
            name: "closeAllValves",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'closeAllValves', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("maintainBaseline", {
            name: "maintainBaseline",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'none', sendTime: new Date().toLocaleString() });
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure10", {
            name: "setPressure10",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 10, 'psi');
                await controller.setPressureTarget('bowPort', 10, 'psi');
                await controller.setPressureTarget('sternPort', 10, 'psi');
                await controller.setPressureTarget('sternStarboard', 10, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure12", {
            name: "setPressure12",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 12, 'psi');
                await controller.setPressureTarget('bowPort', 12, 'psi');
                await controller.setPressureTarget('sternPort', 12, 'psi');
                await controller.setPressureTarget('sternStarboard', 12, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure15", {
            name: "setPressure15",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 15, 'psi');
                await controller.setPressureTarget('bowPort', 15, 'psi');
                await controller.setPressureTarget('sternPort', 15, 'psi');
                await controller.setPressureTarget('sternStarboard', 15, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure17", {
            name: "setPressure17",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 17, 'psi');
                await controller.setPressureTarget('bowPort', 17, 'psi');
                await controller.setPressureTarget('sternPort', 17, 'psi');
                await controller.setPressureTarget('sternStarboard', 17, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure20", {
            name: "setPressure20",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 20, 'psi');
                await controller.setPressureTarget('bowPort', 20, 'psi');
                await controller.setPressureTarget('sternPort', 20, 'psi');
                await controller.setPressureTarget('sternStarboard', 20, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure22", {
            name: "setPressure22",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 22, 'psi');
                await controller.setPressureTarget('bowPort', 22, 'psi');
                await controller.setPressureTarget('sternPort', 22, 'psi');
                await controller.setPressureTarget('sternStarboard', 22, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure25", {
            name: "setPressure25",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 25, 'psi');
                await controller.setPressureTarget('bowPort', 25, 'psi');
                await controller.setPressureTarget('sternPort', 25, 'psi');
                await controller.setPressureTarget('sternStarboard', 25, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure27", {
            name: "setPressure27",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 27, 'psi');
                await controller.setPressureTarget('bowPort', 27, 'psi');
                await controller.setPressureTarget('sternPort', 27, 'psi');
                await controller.setPressureTarget('sternStarboard', 27, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });
        this.patterns.set("setPressure30", {
            name: "setPressure30",
            main: async (controller) => {
                if (this.stopRequested) return;
                await controller.setPressureTarget('bowStarboard', 30, 'psi');
                await controller.setPressureTarget('bowPort', 30, 'psi');
                await controller.setPressureTarget('sternPort', 30, 'psi');
                await controller.setPressureTarget('sternStarboard', 30, 'psi');
                if (this.stopRequested) return;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 2 seconds
            },
        });

        // Add more patterns here
    }

    private async starboardWave(controller: PneumaticsController, maxPressure: number, minPressure: number, intensity: number): Promise<number> {
        const randomDelay = (base: number) => new Promise<void>(resolve => 
            setTimeout(resolve, randomInt(base * (1 - intensity * 0.5), base * (1 + intensity * 0.5)))
        );
        let totalDelay = 0;

        totalDelay += await this.safeRandomDelay(() => randomDelay(500));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowStarboard', maxPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(150));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowPort', maxPressure - 30, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(500));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternStarboard', maxPressure - 20, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(100));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowStarboard', minPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(700));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternPort', maxPressure - 10, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(100));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowPort', minPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(500));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternStarboard', minPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(800));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternPort', minPressure, 'percent');

        return totalDelay;
    }

    private async portWave(controller: PneumaticsController, maxPressure: number, minPressure: number, intensity: number): Promise<number> {
        const randomDelay = (base: number) => new Promise<void>(resolve => 
            setTimeout(resolve, randomInt(base * (1 - intensity * 0.5), base * (1 + intensity * 0.5)))
        );
        let totalDelay = 0;

        totalDelay += await this.safeRandomDelay(() => randomDelay(500));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowPort', maxPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(150));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowStarboard', maxPressure - 30, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(500));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternPort', maxPressure - 20, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(100));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowPort', minPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(700));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternStarboard', maxPressure - 10, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(100));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('bowStarboard', minPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(500));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternPort', minPressure, 'percent');

        totalDelay += await this.safeRandomDelay(() => randomDelay(800));
        if (this.stopRequested) return totalDelay;
        await controller.setPressureTarget('sternStarboard', minPressure, 'percent');

        return totalDelay;
    }

    private async safeRandomDelay(delayFn: () => Promise<void>): Promise<number> {
        const start = Date.now();
        await delayFn();
        return Date.now() - start;
    }
    private async highIntensityRise(controller: PneumaticsController, isPortSide: boolean, intensity: number) {
        const highSide = isPortSide ? 'Port' : 'Starboard';
        const lowSide = isPortSide ? 'Starboard' : 'Port';
        const maxPressure = 90 + Math.floor(intensity * 10); // 90% to 100%
        const minPressure = 10 - Math.floor(intensity * 5); // 10% to 5%

        await controller.setPressureTarget(`bow${highSide}`, maxPressure, 'percent');
        await controller.setPressureTarget(`stern${highSide}`, maxPressure - 10, 'percent');
        await controller.setPressureTarget(`bow${lowSide}`, minPressure, 'percent');
        await controller.setPressureTarget(`stern${lowSide}`, minPressure + 10, 'percent');
    }

    private async holdHighPoint(controller: PneumaticsController, isPortSide: boolean, intensity: number) {
        const highSide = isPortSide ? 'Port' : 'Starboard';
        const lowSide = isPortSide ? 'Starboard' : 'Port';
        const maxPressure = 90 + Math.floor(intensity * 10); // 90% to 100%
        const minPressure = 10 - Math.floor(intensity * 5); // 10% to 5%

        await controller.setPressureTarget(`bow${highSide}`, maxPressure, 'percent');
        await controller.setPressureTarget(`stern${highSide}`, maxPressure, 'percent');
        await controller.setPressureTarget(`bow${lowSide}`, minPressure, 'percent');
        await controller.setPressureTarget(`stern${lowSide}`, minPressure, 'percent');
    }

    private async highIntensityFall(controller: PneumaticsController, isPortSide: boolean, intensity: number) {
        const highSide = isPortSide ? 'Port' : 'Starboard';
        const lowSide = isPortSide ? 'Starboard' : 'Port';
        const maxPressure = 90 + Math.floor(intensity * 10); // 90% to 100%
        const minPressure = 10 - Math.floor(intensity * 5); // 10% to 5%

        await controller.setPressureTarget(`bow${highSide}`, minPressure, 'percent');
        await controller.setPressureTarget(`stern${highSide}`, minPressure + 10, 'percent');
        await controller.setPressureTarget(`bow${lowSide}`, maxPressure - 20, 'percent');
        await controller.setPressureTarget(`stern${lowSide}`, maxPressure - 10, 'percent');
    }

    private async allPistonsToLowestPoint(controller: PneumaticsController) {
        const lowestPressure = 5; // Set all pistons to 5% pressure
        await controller.setPressureTarget('bowPort', lowestPressure, 'percent');
        await controller.setPressureTarget('bowStarboard', lowestPressure, 'percent');
        await controller.setPressureTarget('sternPort', lowestPressure, 'percent');
        await controller.setPressureTarget('sternStarboard', lowestPressure, 'percent');
    }

    private async allPistonsToHighestPoint(controller: PneumaticsController) {
        const highestPressure = 95; // Set all pistons to 5% pressure
        await controller.setPressureTarget('bowPort', highestPressure, 'percent');
        await controller.setPressureTarget('bowStarboard', highestPressure, 'percent');
        await controller.setPressureTarget('sternPort', highestPressure, 'percent');
        await controller.setPressureTarget('sternStarboard', highestPressure, 'percent');
    }

    public async setPattern(patternName: PneumaticsCommandPatternName) {
        const pattern = this.patterns.get(patternName);
        if (pattern) {
            await this.stopPattern(); // Ensure the current pattern is fully stopped
            if (pattern.pressureSettings) {
                this.pneumaticsController.updatePressureSettings(pattern.pressureSettings);
            } else {
                this.pneumaticsController.restoreDefaultPressureSettings();
            }
            this.currentPattern = pattern;
            this.startPattern();
        } else {
            throw new Error(`Pattern '${patternName}' not found`);
        }
    }

    public async startPattern() {
        if (this.isRunning) {
            await this.stopPattern();
        }

        if (!this.currentPattern) {
            console.log("No pattern selected.");
            return;
        }

        this.isRunning = true;
        this.stopRequested = false;
        this.patternSwitchRequested = false;

        this.currentPatternExecution = this.executePattern();
    }

    private async executePattern() {
        try {
            while (!this.stopRequested) {
                if (this.patternSwitchRequested) {
                    console.log("Switching to new pattern...");
                    this.patternSwitchRequested = false;
                    break; // Exit the loop to allow a new pattern to start
                }
                await this.currentPattern!.main(this.pneumaticsController);
                if (this.stopRequested) break;
            }
        } catch (error) {
            console.error("Error running pattern:", error);
        } finally {
            this.isRunning = false;
            this.stopRequested = false;
            this.patternSwitchRequested = false;
            await this.pneumaticsController.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
        }
    }


    public async stopPattern() {
        this.stopRequested = true;
        if (this.currentPatternExecution) {
            await this.currentPatternExecution;
            this.currentPatternExecution = null;
        }
    }

    public stopPattern() {
        this.stopRequested = true;
    }
    public isPatternRunning(): boolean {
        return this.isRunning;
    }

    public getAvailablePatterns(): PneumaticsCommandPatternName[] {
        return Array.from(this.patterns.keys());
    }

    public getCurrentPattern(): PneumaticsCommandPatternName | null {
        return this.currentPattern ? this.currentPattern.name : null;
    }
}

export class PneumaticsModelSingleton {
    private static instance: PneumaticsModelSingleton;
    public model: PneumaticsController;
    public patternController: PneumaticsPatternController;

    private constructor() {
        this.model = new PneumaticsController();
        this.patternController = new PneumaticsPatternController(this.model);
    }

    public static getInstance(): PneumaticsModelSingleton {
        if (!PneumaticsModelSingleton.instance) {
            PneumaticsModelSingleton.instance = new PneumaticsModelSingleton();
        }
        return PneumaticsModelSingleton.instance;
    }
}