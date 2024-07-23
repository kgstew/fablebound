import { AssemblyName } from './assembly-name'

type PressureReading = {
    assemblyName: AssemblyName
    pressureVesselType: 'ballast' | 'piston'
    readingPsi: number
    readDate: Date
}

export { PressureReading }
