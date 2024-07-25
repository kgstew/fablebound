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


export type BowOrSternReadingsData= {
    type: 'espToServerSystemStateBow' | 'espToServerSystemStateStern';
    bigAssMainTank: BigAssMainTankReadings;
    starboard: LegAssemblyReadings;
    port: LegAssemblyReadings;
    sendTime: string;
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

export type PneumaticsCommandGranularBowOrStern = {
    type: string,
    starboard: LegCommandGranular,
    port: LegCommandGranular,
    sendTime: string
}


export type PneumaticsCommandGranularCombined = {
    bow: PneumaticsCommandGranularBowOrStern,
    stern: PneumaticsCommandGranularBowOrStern,
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
    holdBow: 'holdBow',
    raiseStern: 'raiseStern',
    lowerStern: 'lowerStern',
    holdStern: 'holdStern',
    raiseStarboard: 'raiseStarboard',
    lowerStarboard: 'lowerStarboard',
    holdStarboard: 'holdStarboard',
    raisePort: 'raisePort',
    lowerPort: 'lowerPort',
    holdPort: 'holdPort',
    raiseBowStarboard: 'raiseBowStarboard',
    lowerBowStarboard: 'lowerBowStarboard',
    holdBowStarboard: 'holdBowStarboard',
    raiseBowPort: 'raiseBowPort',
    lowerBowPort: 'lowerBowPort',
    holdBowPort: 'holdBowPort',
    raiseSternStarboard: 'raiseSternStarboard',
    lowerSternStarboard: 'lowerSternStarboard',
    holdSternStarboard: 'holdSternStarboard',
    raiseSternPort: 'raiseSternPort',
    lowerSternPort: 'lowerSternPort',
    holdSternPort: 'holdSternPort',
    raiseStarboardStern: 'raiseStarboardStern',
    lowerStarboardStern: 'lowerStarboardStern',
    holdStarboardStern: 'holdStarboardStern',
    raisePortStern: 'raisePortStern',
    lowerPortStern: 'lowerPortStern',
    holdPortStern: 'holdPortStern',
    raiseStarboardBow: 'raiseStarboardBow',
    lowerStarboardBow: 'lowerStarboardBow',
    holdStarboardBow: 'holdStarboardBow',
    raisePortBow: 'raisePortBow',
    lowerPortBow: 'lowerPortBow',
    holdPortBow: 'holdPortBow',
    holdPosition: 'holdPosition',
    ventAll: 'ventAll',
  } as const;
  
 export type PneumaticsCommandText = typeof PneumaticsCommandLibrary[keyof typeof PneumaticsCommandLibrary];
  
 export function isValidPneumaticsCommand(command: string): command is PneumaticsCommandText {
    return command in PneumaticsCommandLibrary;
  }