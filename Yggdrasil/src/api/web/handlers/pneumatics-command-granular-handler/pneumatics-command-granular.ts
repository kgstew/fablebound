import { Valve } from "domain/"


type LegCommandGranular = {
    ballastIntakeValve?: Valve,
    ballastToPistonValve?: Valve,
    pistonReleaseValve?: Valve,
}


type BigAssMainTankCommandGranular = {
    compressorToTankValve?: Valve,
}

type PneumaticsCommandGranular = {
    type: string,
    bowStarboard?: LegCommandGranular,
    bowPort?: LegCommandGranular,
    sternPort?:  LegCommandGranular,
    sternStarboard?:  LegCommandGranular,
    bigAssMainTank?: BigAssMainTankCommandGranular,
    sendTime: string
}

type PneumaticsCommandsGranular = Record<string, PneumaticsCommandGranular>

export { PneumaticsCommandGranular, PneumaticsCommandsGranular, LegCommandGranular, BigAssMainTankCommandGranular}
