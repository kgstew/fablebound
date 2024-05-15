import { PneumaticsAssembly } from './pneumatics-assembly'
import { PressureVessel } from './pressure-vessel'

type PneumaticsSystem = {
    leftRear: PneumaticsAssembly[]
    rightRear: PneumaticsAssembly[]
    leftFront: PneumaticsAssembly[]
    rightFront: PneumaticsAssembly[]
    mainTank: PressureVessel
}

export { PneumaticsSystem }
