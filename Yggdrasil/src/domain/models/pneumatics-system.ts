import { PneumaticsAssembly, PressureVessel } from "."

interface PneumaticsSystem {
    leftRear: PneumaticsAssembly[]
    rightRear: PneumaticsAssembly[]
    leftFront: PneumaticsAssembly[]
    rightFront: PneumaticsAssembly[]
    mainTank: PressureVessel
}

export { PneumaticsSystem }