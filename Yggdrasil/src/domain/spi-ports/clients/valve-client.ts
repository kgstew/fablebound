type ValveClient = {
    openValve(id: string): Promise<void>
    closeValve(id: string): Promise<void>
}

export { ValveClient }
