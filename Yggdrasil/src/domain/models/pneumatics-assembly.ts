import { AssemblyName } from './assembly-name'
import { PressureVessel } from './pressure-vessel'
import { Valve } from './valve'

type PneumaticsAssembly = {
    ballastIntakeValve: Valve
    ballastToPistonValve: Valve
    pistonReleaseValve: Valve
    ballastTank: PressureVessel
    piston: PressureVessel
    assemblyName: AssemblyName
}

export { PneumaticsAssembly }
