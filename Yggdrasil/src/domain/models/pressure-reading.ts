import { Corner } from "./corner"

type PressureReading = {
    side: Corner
    pressureVesselType: 'ballast' | 'piston'
    readingPsi: number
    readDate: Date
}

export { PressureReading }