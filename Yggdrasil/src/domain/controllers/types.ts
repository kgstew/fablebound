import { Valve } from 'domain/models'
import { PneumaticsController } from './pneumatics-controller'

interface LegAssemblyReadings {
    ballastPressurePsi: number
    pistonPressurePsi: number
    ballastIntakeValve: Valve
    ballastToPistonValve: Valve
    pistonReleaseValve: Valve
    distanceSensorPosition: number
}

interface BigAssMainTankReadings {
    pressurePsi: number
    compressorToTankValve: Valve
}

export interface SystemState {
    currentPattern: PneumaticsCommandPatternName | null
    bigAssMainTank: BigAssMainTankReadings
    bowStarboard: LegAssemblyReadings
    bowPort: LegAssemblyReadings
    sternPort: LegAssemblyReadings
    sternStarboard: LegAssemblyReadings
    lastReadingsReceived: Date | null
}

export type BowOrSternReadingsData = {
    type: 'espToServerSystemStateBow' | 'espToServerSystemStateStern'
    bigAssMainTank: BigAssMainTankReadings
    starboard: LegAssemblyReadings
    port: LegAssemblyReadings
    sendTime: string
}

export type ReadingsData = {
    type: 'espToServerSystemState'
    bigAssMainTank: BigAssMainTankReadings
    bowStarboard: LegAssemblyReadings
    bowPort: LegAssemblyReadings
    sternPort: LegAssemblyReadings
    sternStarboard: LegAssemblyReadings
    sendTime: string
}

export type PneumaticsCommandGranular = {
    type: string
    bowStarboard?: LegCommandGranular
    bowPort?: LegCommandGranular
    sternPort?: LegCommandGranular
    sternStarboard?: LegCommandGranular
    bigAssMainTank?: BigAssMainTankCommandGranular
    sendTime: string
}

export type PneumaticsCommandGranularBowOrStern = {
    type: string
    starboard?: LegCommandGranular
    port?: LegCommandGranular
    sendTime: string
}

export type PneumaticsCommandGranularCombined = {
    bow: PneumaticsCommandGranularBowOrStern
    stern: PneumaticsCommandGranularBowOrStern
}

export type LegCommandGranular = {
    ballastIntakeValve?: Valve
    ballastToPistonValve?: Valve
    pistonReleaseValve?: Valve
}

export type BigAssMainTankCommandGranular = {
    compressorToTankValve?: Valve
}

export type PneumaticsCommandsGranular = Record<
    string,
    PneumaticsCommandGranular
>

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

export interface PneumaticsCommandPatternMessage {
    type: 'pneumaticsCommandPattern'
    pattern: PneumaticsCommandPatternName
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
    closeAllValves: 'closeAllValves',
    none: 'none',
} as const

const PneumaticsPatternLibrary = {
    inPort: 'inPort',
    setOutOnAdventure: 'setOutOnAdventure',
    intoTheUnknown: 'intoTheUnknown',
    risingStorm: 'risingStorm',
    stormySeas: 'stormySeas',
    meetTheGods: 'meetTheGods',
    trickstersPromise: 'trickstersPromise',
    arrivingHome: 'arrivingHome',
    upDownUpDown: 'upDownUpDown',
    ventEverything: 'ventEverything',
    closeAllValves: 'closeAllValves',
    maintainBaseline: 'maintainBaseline',
    setPressure10: 'setPressure10',
    setPressure12: 'setPressure12',
    setPressure15: 'setPressure15',
    setPressure17: 'setPressure17',
    setPressure20: 'setPressure20',
    setPressure22: 'setPressure22',
    setPressure25: 'setPressure25',
    setPressure27: 'setPressure27',
    setPressure30: 'setPressure30',
} as const

export type PneumaticsCommandText =
    (typeof PneumaticsCommandLibrary)[keyof typeof PneumaticsCommandLibrary]

export interface PneumaticsCommandPattern {
    name: PneumaticsCommandPatternName
    main: (controller: PneumaticsController, shouldStop: () => boolean) => void
    pressureSettings?: Partial<PressureSettings>
}

export type PneumaticsCommandPatternName =
    (typeof PneumaticsPatternLibrary)[keyof typeof PneumaticsPatternLibrary]
export type PneumaticsCommandPatternMap = Map<
    PneumaticsCommandPatternName,
    PneumaticsCommandPattern
>

export type PressureSettings = {
    ballastTankMaxPressure?: number
    maxPistonPressure?: number
    minPistonPressure?: number
}

export type PressureSettingsOverTime = {
    [timeElapsed: number]: PressureSettings
}

export function isValidPneumaticsCommand(
    command: string
): command is PneumaticsCommandText {
    return command in PneumaticsCommandLibrary
}

export function isValidPneumaticsPattern(
    pattern: string
): pattern is PneumaticsCommandPatternName {
    return pattern in PneumaticsPatternLibrary
}
