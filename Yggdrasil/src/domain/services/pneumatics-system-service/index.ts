import { sideToCorners } from "../../mappers"
import { Corner, PneumaticsAssembly, PressureReading, Side } from "../../models"
import { PneumaticsAssemblyService } from "../pneumatics-assembly-service"

class PneumaticsSystemService {
    constructor(
        private pneumaticsAssemblies: Record<Corner, PneumaticsAssembly>,
        private pneumaticsAssemblyService: PneumaticsAssemblyService,
    ) {}


    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updatePressureReadings(pressureReadings: PressureReading[]): void {
        // TODO
    }

    async moveSide(side: Side, targetLevel: number): Promise<void> {
        const corners = sideToCorners(side)
        const assemblies = corners.map(corner => this.pneumaticsAssemblies[corner])
        
        assemblies.forEach(async (assembly) => {
            const targetReached = await this.pneumaticsAssemblyService.movePiston(assembly, targetLevel)
        })
    }
    
    async closeAllValves(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.pneumaticsAssemblyService.closeAllValves(pneumaticsAssembly)
    }

    async fillBallastTank(pneumaticsAssembly: PneumaticsAssembly): Promise<void> {
        await this.pneumaticsAssemblyService.fillBallastTank(pneumaticsAssembly)
    }
}


export { PneumaticsSystemService }