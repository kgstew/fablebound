interface Valve {
    status: 'open' | 'closed'
}

interface PressureVessel {
    pressurePsi: number
    lastReadingDate: Date
    maxReadingDateAgeMs: number
    maximumPressurePsi: number
    // minimumPressurePsi?: number

}

interface PneumaticsAssembly {
    ballastIntakeValve: Valve
    ballastToPistonValve: Valve
    pistonReleaseValve: Valve
    ballastTank: PressureVessel
    piston: PressureVessel

    // in PneumaticsAssembly, you only want a single valve open at a time
}

interface PneumaticsSystem {
    leftRear: PneumaticsAssembly[]
    rightRear: PneumaticsAssembly[]
    leftFront: PneumaticsAssembly[]
    rightFront: PneumaticsAssembly[]
    mainTank: PressureVessel
}

class ValveService {

    async openValve(valve: Valve): Promise<void> {
        if (valve.status === 'open') {
            return
        }

        valve.status = 'open'
    }

    async closeValve(valve: Valve): Promise<void> {
        if (valve.status === 'closed') {
            return
        }

        valve.status = 'closed'
    }
}

class PressureVesselService {

    async getPressure(pressureVessel: PressureVessel): Promise<number> {
        return pressureVessel.pressurePsi
    }

    async isFillingAllowed(pressureVessel: PressureVessel): Promise<boolean> {
        const pressureBelowMaximum = pressureVessel.pressurePsi <= pressureVessel.maximumPressurePsi
        const pressureRecent = (Date.now() - pressureVessel.lastReadingDate.getTime()) < pressureVessel.maxReadingDateAgeMs
        return pressureBelowMaximum && pressureRecent
    }
}



class PneumaticsAssemblyService {
    constructor(
        private valveService: ValveService,
        private pressureVesselService: PressureVesselService
    ) {}

    
    async closeAllValves(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.valveService.closeValve(pneumaticsAssembly.ballastToPistonValve)
        await this.valveService.closeValve(pneumaticsAssembly.pistonReleaseValve)
        await this.valveService.closeValve(pneumaticsAssembly.ballastIntakeValve)
    }

    async fillBallastTank(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        if (!await this.pressureVesselService.isFillingAllowed(pneumaticsAssembly.ballastTank)) {
            throw new Error('Ballast tank is full')
        }
        await this.valveService.closeValve(pneumaticsAssembly.ballastToPistonValve)
        await this.valveService.closeValve(pneumaticsAssembly.pistonReleaseValve)
        await this.valveService.openValve(pneumaticsAssembly.ballastIntakeValve)
    }

    async fillPiston(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        if (!await this.pressureVesselService.isFillingAllowed(pneumaticsAssembly.piston)) {
            throw new Error('Ballast tank is full')
        }
        await this.valveService.closeValve(pneumaticsAssembly.pistonReleaseValve)
        await this.valveService.closeValve(pneumaticsAssembly.ballastIntakeValve)
        await this.valveService.openValve(pneumaticsAssembly.ballastToPistonValve)
    }

    async releasePiston(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.valveService.closeValve(pneumaticsAssembly.ballastToPistonValve)
        await this.valveService.closeValve(pneumaticsAssembly.ballastIntakeValve)
        await this.valveService.openValve(pneumaticsAssembly.pistonReleaseValve)
    }
}

class PneumaticSystemService {
    constructor(
        private pneumaticsAssemblyService: PneumaticsAssemblyService,
    ) {}

    
    async closeAllValves(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.pneumaticsAssemblyService.closeAllValves(pneumaticsAssembly)
    }

    async fillBallastTank(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.pneumaticsAssemblyService.fillBallastTank(pneumaticsAssembly)
    }

    async fillPiston(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.pneumaticsAssemblyService.fillPiston(pneumaticsAssembly)
    }

    async releasePiston(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.pneumaticsAssemblyService.releasePiston(pneumaticsAssembly)
    }
}
