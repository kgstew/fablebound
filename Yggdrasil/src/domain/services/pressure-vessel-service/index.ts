import { PressureVessel } from "../../models"

class PressureVesselService {

    async getPressure(pressureVessel: PressureVessel): Promise<number> {
        return pressureVessel.pressurePsi
    }

    async isFillingAllowed(pressureVessel: PressureVessel): Promise<boolean> {
        const pressureBelowMaximum = pressureVessel.pressurePsi <= pressureVessel.maximumPressurePsi
        const pressureRecent = (Date.now() - pressureVessel.lastReadingDate.getTime()) < pressureVessel.maxReadingDateAgeMs
        return pressureBelowMaximum && pressureRecent
    }

    async isReleasingAllowed(pressureVessel: PressureVessel): Promise<boolean> {
        // TODO: Is minimum pressure required for releasing?
        const pressureAboveMinimum = true
        const pressureRecent = (Date.now() - pressureVessel.lastReadingDate.getTime()) < pressureVessel.maxReadingDateAgeMs
        return pressureAboveMinimum && pressureRecent
    }
}

export { PressureVesselService }