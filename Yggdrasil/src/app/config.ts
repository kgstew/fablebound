import { PneumaticsAssembly, PneumaticsAssemblyService, PneumaticsSystemService, PressureVesselService, ValveService } from "../domain";

const valveService = new ValveService()
const pressureVesselService = new PressureVesselService()
const pneumaticsAssemblyService = new PneumaticsAssemblyService(valveService, pressureVesselService)

const pneumaticsAssembly: PneumaticsAssembly = {
    ballastIntakeValve: {
        state: 'unknown'
    },
    ballastToPistonValve: {
        state: 'unknown'
    },
    pistonReleaseValve: {
        state: 'unknown'
    },
    ballastTank: {
        pressurePsi: 50,
        lastReadingDate: new Date(),
        maxReadingDateAgeMs: 500,
        maximumPressurePsi: 150
    },
    piston: {
        pressurePsi: 50,
        lastReadingDate: new Date(),
        maxReadingDateAgeMs: 500,
        maximumPressurePsi: 150
    },
    corner: 'frontLeft'
}

const pneumaticsSystemService = new PneumaticsSystemService({
    frontLeft: pneumaticsAssembly,
    frontRight: pneumaticsAssembly,
    rearLeft: pneumaticsAssembly,
    rearRight: pneumaticsAssembly

}, pneumaticsAssemblyService)

export { pneumaticsSystemService }