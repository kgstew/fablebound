import { Corner, PressureVessel, Valve } from "."

type PneumaticsAssembly = {
    ballastIntakeValve: Valve
    ballastToPistonValve: Valve
    pistonReleaseValve: Valve
    ballastTank: PressureVessel
    piston: PressureVessel
    corner: Corner
}

export { PneumaticsAssembly }