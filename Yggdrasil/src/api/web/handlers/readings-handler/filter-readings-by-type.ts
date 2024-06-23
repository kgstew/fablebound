import { Readings } from './readings'

const filterReadingsByType = (
    readings: Readings,
    type: 'temperature' | 'pressure'
): Partial<Readings> => {
    return Object.fromEntries(
        Object.entries(readings).filter(([, value]) => value.type === type)
    )
}

export { filterReadingsByType }
