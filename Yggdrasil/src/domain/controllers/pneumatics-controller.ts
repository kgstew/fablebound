import { LegCommandGranular, PneumaticsCommandGranular, PneumaticsCommandGranularBowOrStern as PneumaticsCommandGranularBowOrStern, PneumaticsCommandGranularCombined } from "api/web/handlers/pneumatics-command-granular-handler/pneumatics-command-granular"
import { FrontendCommandGranularMessage, ReadingsData, SystemState, PneumaticsCommandText, PneumaticsCommandTextMessage, BowOrSternReadingsData, PneumaticsCommandPattern, PneumaticsCommandPatternName, PneumaticsCommandPatternMap, PressureSettings, PressureSettingsOverTime } from "./types"
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
        }, 125); // Run every 334ms (3 times per second)
    }

    public updateCurrentPattern(patternName: PneumaticsCommandPatternName | null) {
        if (this.systemState) {
            this.systemState.currentPattern = patternName;
        }
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
       //     console.warn(`Target pressure ${actualTargetPressure} PSI is out of bounds (${this.minPistonPressure}-${this.maxPistonPressure} PSI). Ignoring.`);
            return;
        }

        //console.log(`Setting pressure set point for ${legAssembly} to ${actualTargetPressure} PSI`);
        this.pressureTargets.set(legAssembly, actualTargetPressure);
    }

    public clearPressureTarget(legAssembly: 'bowStarboard' | 'bowPort' | 'sternPort' | 'sternStarboard'): void {
        this.pressureTargets.delete(legAssembly);
      //  console.log(`Cleared pressure set point for ${legAssembly}`);
    }

    public clearAllPressureTargets(): void {
        this.pressureTargets.clear();
        console.log("Cleared all pressure set points");
    }
    
    public updatePressureTargets(): void {
        for (const [legAssembly, targetPressure] of this.pressureTargets.entries()) {
            const pistonPressure = this.systemState[legAssembly].pistonPressurePsi;
            const ballastPressure = this.systemState[legAssembly].ballastPressurePsi;
            
            if (Math.abs(pistonPressure - targetPressure) <= 2) {
             //   console.log(`Target pressure reached for ${legAssembly}`);
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
             //   console.log(`Insufficient ballast pressure for ${legAssembly}`);
                this.command[legAssembly] = this.valveCommandsHold;
            }
        }
    }
    
    private maintainBaseline() {
        if (!this.systemState) {
            console.log("System state not initialized. Skipping baseline maintenance.");
            return;
        } else {
            this.updateSystemStateFromReadings()
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
        //    console.log("Data sent to esp32.");
        } else {
        //    console.log("Failed to send data: 'esp32' connection does not exist.");
        }
        if ('esp32stern' in webSocketConnections) {
            webSocketConnections['esp32stern'].send(JSON.stringify(outgoingCommand.stern));
        //    console.log("Data sent to esp32.");
        } else {
          //  console.log("Failed to send data: 'esp32' connection does not exist.");
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
            currentPattern: null,
            bigAssMainTank: systemStateReadings.bigAssMainTank,
            bowStarboard: systemStateReadings.bowStarboard,
            bowPort: systemStateReadings.bowPort,
            sternPort: systemStateReadings.sternPort,
            sternStarboard: systemStateReadings.sternStarboard,
            lastReadingsReceived: new Date(systemStateReadings.sendTime),
        }
        this.updateSystemStateLogs
    }

    public updateSystemStateFromReadings(systemStateReadings?: BowOrSternReadingsData) {
        if (systemStateReadings) {
            if (systemStateReadings.type == 'espToServerSystemStateBow') {
                this.systemState.bowStarboard = systemStateReadings.starboard
                this.systemState.bowPort = systemStateReadings.port
            } else if (systemStateReadings.type == 'espToServerSystemStateStern') {
                this.systemState.sternStarboard = systemStateReadings.starboard
                this.systemState.sternPort = systemStateReadings.port
            }
            this.systemState.lastReadingsReceived = new Date(systemStateReadings.sendTime)
        }
       // console.log("SYSTEM STATE")
        //console.log(this.systemState)
        //console.log("END SYSTEM STATE")
        if ('frontend' in webSocketConnections) {
            webSocketConnections['frontend'].send(JSON.stringify(this.systemState));
            //console.log("Data sent to frontend.");
        } else {
          //  console.log("Failed to send data: 'frontend' connection does not exist.");
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
                  //  console.log(`Opportunistically filling ballast for ${legAssembly}. Current pressure: ${currentPressure}, Max pressure: ${this.ballastTankMaxPressure}`);
                } else {
                  //  console.log(`Not filling ballast for ${legAssembly}. Current pressure (${currentPressure}) not below max (${this.ballastTankMaxPressure})`);
                }
            } else {
               // console.log(`Skipping ballast fill for ${legAssembly}. Pressure data unavailable.`);
            }
        } else {
            //console.log(`Not filling ballast for ${legAssembly}. Piston valve is not closed or there's an existing command.`);
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
            this.setPressureTarget(legAssembly, this.minPistonPressure+1, 'psi')
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
    public currentPattern: PneumaticsCommandPattern | null = null;
    private patterns: PneumaticsCommandPatternMap = new Map();
    private isRunning: boolean = false;
    private stopRequested: boolean = false;
    private patternSwitchRequested: boolean = false;
    private currentPatternExecution: Promise<void> | null = null;
    private patternStartTime: number = 0;
    private inPatternTimeMarker: number = 0


    constructor(pneumaticsController: PneumaticsController) {
        this.pneumaticsController = pneumaticsController;
        this.initializePatterns();
    }

    public notifyPatternChange(patternName: PneumaticsCommandPatternName | null) {
        // This method is implemented in PneumaticsModelSingleton
    }

    private initializePatterns() {
        this.patterns.set("inPort", {
            name: "inPort",
            pressureSettings: {
                ballastTankMaxPressure: 34,
                maxPistonPressure: 25,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                    if (shouldStop()) return;
                    await controller.setPressureTarget('bowStarboard', 100, 'percent');
                    await controller.setPressureTarget('sternStarboard', 100, 'percent');
                    await controller.setPressureTarget('bowPort', 0, 'percent');
                    await controller.setPressureTarget('sternPort', 0, 'percent');
                    await this.sleep(randomInt(2000,3000), shouldStop);               
                    if (shouldStop()) return;
                    await controller.setPressureTarget('bowStarboard', 0, 'percent');
                    await controller.setPressureTarget('sternStarboard', 0, 'percent');
                    await controller.setPressureTarget('bowPort', 100, 'percent');
                    await controller.setPressureTarget('sternPort', 100, 'percent');
                    await this.sleep(randomInt(2000,3000), shouldStop);    
                    if (shouldStop()) return;
            }
        });
        this.patterns.set("setOutOnAdventure", {
            name: "setOutOnAdventure",
            pressureSettings: {
                ballastTankMaxPressure: 38,
                maxPistonPressure: 27,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 100, 'percent');
                await controller.setPressureTarget('bowPort', 0, 'percent');
                await controller.setPressureTarget('sternStarboard', 100, 'percent');
                await controller.setPressureTarget('sternPort', 0, 'percent');
                await this.sleep(randomInt(3000,4000), shouldStop);                 
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 0, 'percent');
                await controller.setPressureTarget('bowPort', 100, 'percent');
                await controller.setPressureTarget('sternStarboard', 0, 'percent');
                await controller.setPressureTarget('sternPort', 100, 'percent');
                await this.sleep(randomInt(3000,4000), shouldStop);    
                if (shouldStop()) return;
            }
        });
        this.patterns.set("intoTheUnknown", {
            name: "intoTheUnknown",
            pressureSettings: {
                ballastTankMaxPressure: 44,
                maxPistonPressure: 28,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                await this.starboardWave(controller, shouldStop);
                if (shouldStop()) return;
            }
        });
        this.patterns.set("risingStorm", {
            name: "risingStorm",
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 29,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {                
                this.patternStartTime = Date.now();
                const pressureIncreases: PressureSettingsOverTime = {
                    0: {ballastTankMaxPressure: 60, maxPistonPressure: 29, minPistonPressure: 22},
                    30000: {ballastTankMaxPressure: 60, maxPistonPressure: 30, minPistonPressure: 22},
                    60000: {ballastTankMaxPressure: 65, maxPistonPressure: 31, minPistonPressure: 22},
                    90000: {ballastTankMaxPressure: 65, maxPistonPressure: 32, minPistonPressure: 22},
                }
                while (!shouldStop()) {
                    if (shouldStop()) return;
                    const side = this.chooseRandomSide();
                    if (side === 'starboard') {
                        await this.starboardWave(controller, shouldStop);
                        if (shouldStop()) return;
                    } else {
                        await this.portWave(controller, shouldStop);
                        if (shouldStop()) return;
                    }
                    let newPressureSettings = pressureIncreases[0];
                    Object.entries(pressureIncreases).forEach(([timeElapsed, settings]) => {
                        if (Date.now() - this.patternStartTime > parseInt(timeElapsed)) {
                            newPressureSettings = settings;
                        }
                    });
                    controller.updatePressureSettings(newPressureSettings);
                    if (shouldStop()) return;
                }
            }
        });
        this.patterns.set("stormySeas", {
            name: "stormySeas",
            pressureSettings: {
                ballastTankMaxPressure: 65,
                maxPistonPressure: 32,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                this.patternStartTime = Date.now();
                this.inPatternTimeMarker = 110000;
                const pressureIncreases: PressureSettingsOverTime = {
                    0: {ballastTankMaxPressure: 70, maxPistonPressure: 32, minPistonPressure: 22},
                    30000: {ballastTankMaxPressure: 70, maxPistonPressure: 32, minPistonPressure: 22},
                    60000: {ballastTankMaxPressure: 70, maxPistonPressure: 33, minPistonPressure: 22},
                    90000: {ballastTankMaxPressure: 70, maxPistonPressure: 33, minPistonPressure: 22},
                }
                while (!this.stopRequested && (Date.now() - this.patternStartTime < this.inPatternTimeMarker)) {
                    if (shouldStop()) return;
                    const timeElapsed = Date.now() - this.patternStartTime;
                    if (timeElapsed > 60000) {
                        await this.bigCrashyWave(controller, shouldStop);
                        if (shouldStop()) return;
                    } else if (Math.random() < 0.5) {
                        await this.starboardWave(controller, shouldStop);
                        if (shouldStop()) return;
                    } else {
                        await this.portWave(controller, shouldStop);
                        if (shouldStop()) return;
                    }
                    let newPressureSettings = pressureIncreases[0];
                    Object.entries(pressureIncreases).forEach(([timeElapsed, settings]) => {
                        if (Date.now() - this.patternStartTime > parseInt(timeElapsed)) {
                            newPressureSettings = settings;
                        }
                    });                    
                    if (shouldStop()) return;
                    controller.updatePressureSettings(newPressureSettings);
                }
                while (!this.stopRequested && (Date.now() - this.patternStartTime) >= this.inPatternTimeMarker) {
                    if (shouldStop()) return;
                    await this.allPistonsToLowestPoint(controller);
                    await this.sleep(randomInt(2000,3200), shouldStop);     // Small delay to prevent excessive CPU usage

                }
            }
        });
        this.patterns.set("meetTheGods", {
            name: "meetTheGods",
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 33,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                let initialSequenceCompleted = false;

                while (!shouldStop()) {
                    if (!initialSequenceCompleted) {
                        await this.sleep(2000, shouldStop);

                        // Raise bow
                        await controller.setPressureTarget('bowStarboard', 33, 'psi');
                        await controller.setPressureTarget('bowPort', 33, 'psi');    
                        await controller.setPressureTarget('sternPort', 22, 'psi');
                        await controller.setPressureTarget('sternStarboard', 22, 'psi');                    
                        if (shouldStop()) return;
                        await this.sleep(2400, shouldStop);

                        // Raise stern
                        await controller.setPressureTarget('bowStarboard', 33, 'psi');
                        await controller.setPressureTarget('bowPort', 33, 'psi');
                        await controller.setPressureTarget('sternPort', 33, 'psi');
                        await controller.setPressureTarget('sternStarboard', 33, 'psi');                       
                        if (shouldStop()) return;
                        await this.sleep(4000, shouldStop);

                        initialSequenceCompleted = true;
                    }

                    // Set and maintain pressure at 30 PSI for all legs
                    await controller.setPressureTarget('bowStarboard', 33, 'psi');
                    await controller.setPressureTarget('bowPort', 33, 'psi');
                    await controller.setPressureTarget('sternPort', 33, 'psi');
                    await controller.setPressureTarget('sternStarboard', 33, 'psi');
                    if (shouldStop()) return;
                    await this.sleep(5000, shouldStop);

                    await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                    if (shouldStop()) return;
                    await this.sleep(1000, shouldStop);
                }
            }
        });
        this.patterns.set("trickstersPromise", {
            name: "trickstersPromise",
            pressureSettings: {
                ballastTankMaxPressure: 40,
                maxPistonPressure: 32,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                this.patternStartTime = Date.now();
                this.inPatternTimeMarker = 170000

                while (!shouldStop() && (Date.now() - this.patternStartTime) < this.inPatternTimeMarker) {
                    
                    await controller.setPressureTarget('bowStarboard', 70, 'percent');
                    await controller.setPressureTarget('bowPort', 70, 'percent');
                    await controller.setPressureTarget('sternPort', 70, 'percent');
                    await controller.setPressureTarget('sternStarboard', 70, 'percent');                    
                    if (shouldStop()) return;            
                    if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                    await this.sleep(randomInt(2000,3700), shouldStop);    

                    const randomSelection = randomInt(0, 2);

                    // front to back
                    if (randomSelection === 0) {
                        await controller.setPressureTarget('bowStarboard', 80, 'percent');
                        await controller.setPressureTarget('bowPort', 80, 'percent');
                        await controller.setPressureTarget('sternPort', 60, 'percent');
                        await controller.setPressureTarget('sternStarboard', 60, 'percent');                  
                        if (shouldStop()) return;            
                        if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                        await this.sleep(randomInt(2000,3200), shouldStop);    
                        await controller.setPressureTarget('bowStarboard', 60, 'percent');
                        await controller.setPressureTarget('bowPort', 60, 'percent');
                        await controller.setPressureTarget('sternPort', 80, 'percent');
                        await controller.setPressureTarget('sternStarboard', 80, 'percent');                  
                        if (shouldStop()) return;
                        if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                        await this.sleep(randomInt(2000,3200), shouldStop);    
                    } 
                    // side to side
                    else if (randomSelection === 1) {
                        await controller.setPressureTarget('bowStarboard', 80, 'percent');
                        await controller.setPressureTarget('bowPort', 60, 'percent');
                        await controller.setPressureTarget('sternPort', 60, 'percent');
                        await controller.setPressureTarget('sternStarboard', 80, 'percent');                  
                        if (shouldStop()) return;            
                        if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                        await this.sleep(randomInt(2000,3200), shouldStop);    

                        await controller.setPressureTarget('bowStarboard', 60, 'percent');
                        await controller.setPressureTarget('bowPort', 80, 'percent');
                        await controller.setPressureTarget('sternPort', 80, 'percent');
                        await controller.setPressureTarget('sternStarboard', 60, 'percent');                  
                        if (shouldStop()) return;      
                        if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                        await this.sleep(randomInt(2000,3200), shouldStop);    

                    }
                    // High-intensity fall
                    else if (randomSelection === 2) {
                        await controller.setPressureTarget('bowStarboard', 50, 'percent');
                        await controller.setPressureTarget('bowPort', 50, 'percent');
                        await controller.setPressureTarget('sternPort', 50, 'percent');
                        await controller.setPressureTarget('sternStarboard', 50, 'percent');                  
                        if (shouldStop()) return;      
                        if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;                        
                        await this.sleep(randomInt(1000,2000), shouldStop);    

                        await controller.setPressureTarget('bowStarboard', 80, 'percent');
                        await controller.setPressureTarget('bowPort', 80, 'percent');
                        await controller.setPressureTarget('sternPort', 80, 'percent');
                        await controller.setPressureTarget('sternStarboard', 80, 'percent');                  
                        if (shouldStop()) return;      
                        if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                        await this.sleep(randomInt(2000,3200), shouldStop);    
                    }

                    if (shouldStop()) return;
                    if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) break;
                    await this.sleep(randomInt(2000,3200), shouldStop);    // Small delay to prevent excessive CPU usage
                }   

                // Finish with all pistons at highest point
                while (!this.stopRequested && (Date.now() - this.patternStartTime) >= this.inPatternTimeMarker) {
                    if (shouldStop()) return;
                    await this.allPistonsToHighestPoint(controller);                    
                    await this.sleep(randomInt(2000,3200), shouldStop);     // Small delay to prevent excessive CPU usage

                }

            }
        });
        this.patterns.set("arrivingHome", {
            name: "arrivingHome",
            pressureSettings: {
                ballastTankMaxPressure: 60,
                maxPistonPressure: 32,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                // Drop the boat!!
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerBow', sendTime: new Date().toLocaleString() });
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerStern', sendTime: new Date().toLocaleString() });
                await this.allPistonsToLowestPoint(controller);                    
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.allPistonsToHighestPoint(controller);                    
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseBow', sendTime: new Date().toLocaleString() });
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseStern', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                
            },
        });
        this.patterns.set("upDownUpDown", {
            name: "upDownUpDown",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseBow', sendTime: new Date().toLocaleString() });
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseStern', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerBow', sendTime: new Date().toLocaleString() });
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerStern', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("ventEverything", {
            name: "ventEverything",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'ventAll', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("closeAllValves", {
            name: "closeAllValves",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'closeAllValves', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("maintainBaseline", {
            name: "maintainBaseline",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'none', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure10", {
            name: "setPressure10",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 10, 'psi');
                await controller.setPressureTarget('bowPort', 10, 'psi');
                await controller.setPressureTarget('sternPort', 10, 'psi');
                await controller.setPressureTarget('sternStarboard', 10, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure12", {
            name: "setPressure12",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 12, 'psi');
                await controller.setPressureTarget('bowPort', 12, 'psi');
                await controller.setPressureTarget('sternPort', 12, 'psi');
                await controller.setPressureTarget('sternStarboard', 12, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure15", {
            name: "setPressure15",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 15, 'psi');
                await controller.setPressureTarget('bowPort', 15, 'psi');
                await controller.setPressureTarget('sternPort', 15, 'psi');
                await controller.setPressureTarget('sternStarboard', 15, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure17", {
            name: "setPressure17",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 17, 'psi');
                await controller.setPressureTarget('bowPort', 17, 'psi');
                await controller.setPressureTarget('sternPort', 17, 'psi');
                await controller.setPressureTarget('sternStarboard', 17, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure20", {
            name: "setPressure20",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 20, 'psi');
                await controller.setPressureTarget('bowPort', 20, 'psi');
                await controller.setPressureTarget('sternPort', 20, 'psi');
                await controller.setPressureTarget('sternStarboard', 20, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure22", {
            name: "setPressure22",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 22, 'psi');
                await controller.setPressureTarget('bowPort', 22, 'psi');
                await controller.setPressureTarget('sternPort', 22, 'psi');
                await controller.setPressureTarget('sternStarboard', 22, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure25", {
            name: "setPressure25",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 25, 'psi');
                await controller.setPressureTarget('bowPort', 25, 'psi');
                await controller.setPressureTarget('sternPort', 25, 'psi');
                await controller.setPressureTarget('sternStarboard', 25, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure27", {
            name: "setPressure27",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 27, 'psi');
                await controller.setPressureTarget('bowPort', 27, 'psi');
                await controller.setPressureTarget('sternPort', 27, 'psi');
                await controller.setPressureTarget('sternStarboard', 27, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });
        this.patterns.set("setPressure30", {
            name: "setPressure30",
            main: async (controller, shouldStop) => {
                if (shouldStop()) return;
                await controller.setPressureTarget('bowStarboard', 30, 'psi');
                await controller.setPressureTarget('bowPort', 30, 'psi');
                await controller.setPressureTarget('sternPort', 30, 'psi');
                await controller.setPressureTarget('sternStarboard', 30, 'psi');
                if (shouldStop()) return;
                await this.sleep(1000, shouldStop);
            },
        });

        // Add more patterns here
    }

    private async starboardWave(controller: PneumaticsController, shouldStop: () => boolean) {
        console.log('starboardWave')
        await controller.setPressureTarget('bowStarboard', 90, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                   
        if (shouldStop()) return;

        // Raise port bow slightly and starboard stern
        await controller.setPressureTarget('bowPort', 60, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);               
        if (shouldStop()) return;

        await controller.setPressureTarget('sternStarboard', 70, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                 
        if (shouldStop()) return;

        // Lower starboard bow, raise port stern
        await controller.setPressureTarget('bowStarboard', 30, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);              
        if (shouldStop()) return;
           
        await controller.setPressureTarget('sternPort', 80, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                  
        if (shouldStop()) return;

        // Lower port bow and starboard stern
        await controller.setPressureTarget('bowPort', 20, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);                 
        if (shouldStop()) return;

        await controller.setPressureTarget('sternStarboard', 20, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                   
        if (shouldStop()) return;

        // Lower port stern
        await controller.setPressureTarget('sternPort', 20, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);               
        if (shouldStop()) return;
    }


    private async portWave(controller: PneumaticsController, shouldStop: () => boolean) {
        console.log('portWave')
        await controller.setPressureTarget('bowPort', 90, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                  
        if (shouldStop()) return;

        // Raise port bow slightly and starboard stern
        await controller.setPressureTarget('bowStarboard', 60, 'percent');
        await this.sleep(randomInt(1000,2000), shouldStop);                    
        if (shouldStop()) return;

        await controller.setPressureTarget('sternPort', 70, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                    
        if (shouldStop()) return;

        // Lower starboard bow, raise port stern
        await controller.setPressureTarget('bowPort', 30, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);                  
        if (shouldStop()) return;
   
        await controller.setPressureTarget('sternStarboard', 80, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                    
        if (shouldStop()) return;

        // Lower port bow and starboard stern
        await controller.setPressureTarget('bowStarboard', 20, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);              
        if (shouldStop()) return;
  
        await controller.setPressureTarget('sternPort', 20, 'percent');
        await this.sleep(randomInt(1000,2400), shouldStop);                
        if (shouldStop()) return;

        // Lower port stern
        await controller.setPressureTarget('sternStarboard', 20, 'percent');
        await this.sleep(randomInt(800,1700), shouldStop);              
        if (shouldStop()) return;
    }



    private async bigCrashyWave(controller: PneumaticsController, shouldStop: () => boolean) {
        //raise the bow and drop the stern
        if (Math.random() < 0.5) {
            await controller.setPressureTarget('bowPort', 100, 'percent');
            await controller.setPressureTarget('bowStarboard', 75, 'percent');
            if (Math.random() < 0.5) {
                await controller.setPressureTarget('sternPort', 0, 'percent');
                await controller.setPressureTarget('sternStarboard', 25, 'percent');
            } else {
                await controller.setPressureTarget('sternPort', 25, 'percent');
                await controller.setPressureTarget('sternStarboard', 0, 'percent');
            }
            if (shouldStop()) return;
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) return;
            await this.sleep(randomInt(1200,2500), shouldStop);                
        } else {
            await controller.setPressureTarget('bowPort', 75, 'percent');
            await controller.setPressureTarget('bowStarboard', 100, 'percent');
            if (shouldStop()) return;
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) return;
            await this.sleep(randomInt(1200,2500), shouldStop);             
        }

        //raise the stern
        if (Math.random() < 0.5) {
            await controller.setPressureTarget('sternPort', 100, 'percent');
            await controller.setPressureTarget('sternStarboard', 75, 'percent');
            if (shouldStop()) return;
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) return;
            await this.sleep(randomInt(1200,2500), shouldStop);                
        } else {
            await controller.setPressureTarget('sternPort', 75, 'percent');
            await controller.setPressureTarget('sternStarboard', 100, 'percent');
            if (shouldStop()) return;
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) return;
            await this.sleep(randomInt(1200,2500), shouldStop);                
        }

        //drop the bow
        if (Math.random() < 0.5) {
            await controller.setPressureTarget('sternPort', 0, 'percent');
            await controller.setPressureTarget('sternStarboard', 25, 'percent');
            if (shouldStop()) return;
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) return;
            await this.sleep(randomInt(1200,2500), shouldStop);                
        } else {
            await controller.setPressureTarget('sternPort', 25, 'percent');
            await controller.setPressureTarget('sternStarboard', 0, 'percent');
            if (shouldStop()) return;
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker) return;
            await this.sleep(randomInt(1200,2500), shouldStop);                
        }
    }

    private chooseRandomSide() {
        const randomSide = Math.random() < 0.5 ? 'port' : 'starboard';
        return randomSide
    }
    
    private async sleep(ms: number, shouldStop: () => boolean): Promise<void> {
        const sleepInterval = 100; // Check every 100ms
        for (let elapsed = 0; elapsed < ms; elapsed += sleepInterval) {
            if (shouldStop()) return;
            await new Promise(resolve => setTimeout(resolve, sleepInterval));
        }
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
        this.patternSwitchRequested = true;
        const pattern = this.patterns.get(patternName);
        if (pattern) {
            await this.stopPattern(); // Ensure the current pattern is fully stopped
            console.log("1")
            if (pattern.pressureSettings) {
                this.pneumaticsController.updatePressureSettings(pattern.pressureSettings);
            } else {
                this.pneumaticsController.restoreDefaultPressureSettings();
            }
            console.log("2")
            this.currentPattern = pattern;
            this.notifyPatternChange(patternName); // Notify about the new pattern
            console.log(`current pattern now: ${this.currentPattern.name}`)
            await this.startPattern();
            console.log("started pattern")
        } else {
            throw new Error(`Pattern '${patternName}' not found`);
        }
    }

    public async startPattern() {

        if (!this.currentPattern) {
            console.log("No pattern selected.");
            return;
        }

        this.isRunning = true;
        this.stopRequested = false;
        this.patternSwitchRequested = false;
        console.log("starting pattern", this.currentPattern.name)

        this.currentPatternExecution = this.executePattern();
    }

    private async executePattern() {
        try {
            await this.currentPattern!.main(this.pneumaticsController, () => this.stopRequested);
            
        } catch (error) {
            console.error("Error running pattern:", error);
        } finally {
            this.isRunning = false;
            this.patternSwitchRequested = false;
            await this.pneumaticsController.handleCommand({ type: 'pneumaticsCommandText', command: 'holdPosition', sendTime: new Date().toLocaleString() });
        }
    }


    public async stopPattern() {
        this.stopRequested = true;
        if (this.currentPatternExecution) {
            console.log("waiting for pattern to stop")
            await this.currentPatternExecution;
            console.log("pattern stopped")
            this.currentPatternExecution = null;
        }        
        this.notifyPatternChange(null); // Notify that no pattern is running

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

        // Implement the notifyPatternChange method
        this.patternController.notifyPatternChange = (patternName: PneumaticsCommandPatternName | null) => {
            this.model.updateCurrentPattern(patternName);
        };
    }

    public static getInstance(): PneumaticsModelSingleton {
        if (!PneumaticsModelSingleton.instance) {
            PneumaticsModelSingleton.instance = new PneumaticsModelSingleton();
        }
        return PneumaticsModelSingleton.instance;
    }
}