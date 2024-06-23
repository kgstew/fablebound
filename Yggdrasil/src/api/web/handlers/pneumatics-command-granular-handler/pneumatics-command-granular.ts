type PneumaticsCommandGranular = {
    location: string
    action: string
    unit: string
}

type PneumaticsCommandsGranular = Record<string, PneumaticsCommandGranular>

export { PneumaticsCommandGranular, PneumaticsCommandsGranular}
