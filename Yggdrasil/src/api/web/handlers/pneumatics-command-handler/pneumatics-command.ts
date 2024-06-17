type PneumaticsCommand = {
    location: string
    action: string
    unit: string
}

type PneumaticsCommands = Record<string, PneumaticsCommand>

export { PneumaticsCommand, PneumaticsCommands}
