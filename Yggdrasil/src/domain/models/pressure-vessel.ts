interface PressureVessel {
    pressurePsi: number
    lastReadingDate: Date
    maxReadingDateAgeMs: number
    maximumPressurePsi: number
    // minimumPressurePsi?: number
}

export { PressureVessel }