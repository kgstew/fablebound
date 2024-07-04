import { Valve } from "domain/models"


interface LegAssemblyReadings {
    ballastPressurePsi: number
    pistonPressurePsi: number
    ballastIntakeValve: Valve
    ballastToPistonValve: Valve
    pistonReleaseValve: Valve
}

interface BigAssMainTankReadings {
    pressurePsi: number
    compressorToTankValve: Valve
}


export interface SystemState {
    bigAssMainTank: BigAssMainTankReadings
    bowStarboard: LegAssemblyReadings
    bowPort: LegAssemblyReadings
    sternPort: LegAssemblyReadings
    sternStarboard: LegAssemblyReadings
    lastReadingsReceived: Date | null
}


export type ReadingsData= {
    type: 'espToServerSystemState';
    bigAssMainTank: BigAssMainTankReadings;
    bowStarboard: LegAssemblyReadings;
    bowPort: LegAssemblyReadings;
    sternPort: LegAssemblyReadings;
    sternStarboard: LegAssemblyReadings;
    sendTime: string;
}


export type PneumaticsCommandGranular = {
    type: string,
    bowStarboard?: LegCommandGranular,
    bowPort?: LegCommandGranular,
    sternPort?:  LegCommandGranular,
    sternStarboard?:  LegCommandGranular,
    bigAssMainTank?: BigAssMainTankCommandGranular,
    sendTime: string
}


export type  LegCommandGranular = {
    ballastIntakeValve?: Valve,
    ballastToPistonValve?: Valve,
    pistonReleaseValve?: Valve,
}


export type BigAssMainTankCommandGranular = {
    compressorToTankValve?: Valve,
}

export type PneumaticsCommandsGranular = Record<string, PneumaticsCommandGranular>

export interface CommandDetailGranular {
    assembly: keyof PneumaticsCommandGranular // Refers to 'bowStarboard', 'bowPort', etc.
    valve: keyof LegCommandGranular | keyof BigAssMainTankCommandGranular // Refers to 'ballastIntakeValve', 'ballastToPistonValve', etc.
    state: Valve
}


export interface FrontendCommandGranularMessage {
    type: 'pneumaticsCommandGranular'
    command: CommandDetailGranular
    sendTime: string
}


export interface PneumaticsCommandTextMessage {
    type: 'pneumaticsCommandText'
    command: PneumaticsCommandText
    sendTime: string
}

const PneumaticsCommandLibrary = {
    raiseBow: 'raiseBow',
    lowerBow: 'lowerBow',
    raiseStern: 'raiseStern',
    lowerStern: 'lowerStern',
    raiseStarboard: 'raiseStarboard',
    lowerStarboard: 'lowerStarboard',
    raisePort: 'raisePort',
    lowerPort: 'lowerPort',
    raiseBowStarboard: 'raiseBowStarboard',
    lowerBowStarboard: 'lowerBowStarboard',
    raiseBowPort: 'raiseBowPort',
    lowerBowPort: 'lowerBowPort',
    raiseSternStarboard: 'raiseSternStarboard',
    lowerSternStarboard: 'lowerSternStarboard',
    raiseSternPort: 'raiseSternPort',
    lowerSternPort: 'lowerSternPort',
    raiseStarboardAft: 'raiseStarboardAft',
    lowerStarboardAft: 'lowerStarboardAft',
    raisePortAft: 'raisePortAft',
    lowerPortAft: 'lowerPortAft',
    raiseStarboardBow: 'raiseStarboardBow',
    lowerStarboardBow: 'lowerStarboardBow',
    raisePortBow: 'raisePortBow',
    lowerPortBow: 'lowerPortBow',
    holdPosition: 'holdPosition',
  } as const;
  
 export type PneumaticsCommandText = typeof PneumaticsCommandLibrary[keyof typeof PneumaticsCommandLibrary];
  
 export function isValidPneumaticsCommand(command: string): command is PneumaticsCommandText {
    return command in PneumaticsCommandLibrary;
  }