import { Corner } from './assembly-name'

type PressureReading = {
    corner: Corner
    pressureVesselType: 'ballast' | 'piston'
    readingPsi: number
    readDate: Date
}

export { PressureReading }
