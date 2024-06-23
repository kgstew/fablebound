import { Corner } from './corner'
import { PressureVessel } from './pressure-vessel'
import { Valve } from './valve'

type PneumaticsAssembly = {
    ballastIntakeValve: Valve
    ballastToPistonValve: Valve
    pistonReleaseValve: Valve
    ballastTank: PressureVessel
    piston: PressureVessel
    corner: Corner
}

export { PneumaticsAssembly }
