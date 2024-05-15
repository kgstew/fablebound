import { Corner } from './corner'

type PressureReading = {
    corner: Corner
    pressureVesselType: 'ballast' | 'piston'
    readingPsi: number
    readDate: Date
}

export { PressureReading }
