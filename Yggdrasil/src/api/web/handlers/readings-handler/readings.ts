type Reading = {
    type: string
    unit: string
    value: number
    readTime: Date
}

type Readings = Record<string, Reading>

export { Reading, Readings }
