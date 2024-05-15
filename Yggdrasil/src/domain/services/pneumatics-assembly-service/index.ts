import { PressureVesselService } from '../pressure-vessel-service'
import { PneumaticsAssembly } from '../../models'
import { ValveService } from '../valve-service'

class PneumaticsAssemblyService {
    constructor(
        private valveService: ValveService,
        private pressureVesselService: PressureVesselService
    ) {}

    async closeAllValves(
        pneumaticsAssembly: PneumaticsAssembly
    ): Promise<void> {
        await this.valveService.closeValve(
            pneumaticsAssembly.ballastToPistonValve
        )
        await this.valveService.closeValve(
            pneumaticsAssembly.pistonReleaseValve
        )
        await this.valveService.closeValve(
            pneumaticsAssembly.ballastIntakeValve
        )
    }

    async fillBallastTank(
        pneumaticsAssembly: PneumaticsAssembly
    ): Promise<boolean> {
        if (
            !(await this.pressureVesselService.isFillingAllowed(
                pneumaticsAssembly.ballastTank
            ))
        ) {
            return false
        }
        await this.valveService.closeValve(
            pneumaticsAssembly.ballastToPistonValve
        )
        await this.valveService.closeValve(
            pneumaticsAssembly.pistonReleaseValve
        )
        await this.valveService.openValve(pneumaticsAssembly.ballastIntakeValve)
        return true
    }

    async movePiston(
        pneumaticsAssembly: PneumaticsAssembly,
        targetPressurePsi: number
    ): Promise<boolean> {
        // TODO: Implement a range for targetLevel instead of a single value to avoid oscillation
        const currentPressurePsi = await this.pressureVesselService.getPressure(
            pneumaticsAssembly.piston
        )
        if (currentPressurePsi > targetPressurePsi) {
            return this.releasePiston(pneumaticsAssembly)
        } else if (currentPressurePsi < targetPressurePsi) {
            return this.fillPiston(pneumaticsAssembly)
        }
        return false
    }

    private async fillPiston(
        pneumaticsAssembly: PneumaticsAssembly
    ): Promise<boolean> {
        if (
            !(await this.pressureVesselService.isFillingAllowed(
                pneumaticsAssembly.piston
            ))
        ) {
            return false
        }
        await this.valveService.closeValve(
            pneumaticsAssembly.pistonReleaseValve
        )
        await this.valveService.closeValve(
            pneumaticsAssembly.ballastIntakeValve
        )
        await this.valveService.openValve(
            pneumaticsAssembly.ballastToPistonValve
        )
        return true
    }

    private async releasePiston(
        pneumaticsAssembly: PneumaticsAssembly
    ): Promise<boolean> {
        await this.valveService.closeValve(
            pneumaticsAssembly.ballastToPistonValve
        )
        await this.valveService.closeValve(
            pneumaticsAssembly.ballastIntakeValve
        )
        await this.valveService.openValve(pneumaticsAssembly.pistonReleaseValve)
        return true
    }
}

export { PneumaticsAssemblyService }
