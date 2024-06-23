import { PneumaticsSystemService, PressureReading } from 'domain/'
import { Handler } from '../handler'
import { Readings } from './readings'

const filterReadingsByType = (
    readings: Readings,
    type: 'temperature' | 'pressure'
): Partial<Readings> => {
    return Object.fromEntries(
        Object.entries(readings).filter(([, value]) => value.type === type)
    )
}

class ReadingsHandler implements Handler<Readings> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}
    validate(data: unknown): Readings {
        if (!data) {
            throw new Error('Data is required')
        }
        throw new Error('Method not implemented.')
    }
    async handle(data: unknown): Promise<void> {
        const readings = this.validate(data)

        this.pneumaticSystemService.updatePressureReadings(
            filterReadingsByType(
                readings,
                'pressure'
            ) as unknown as PressureReading[] // TODO: Fix PressureReading[]
        )

        throw new Error('Method not implemented.')
    }
}

export { ReadingsHandler }
