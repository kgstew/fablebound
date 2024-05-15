import { ValveClient } from 'domain/spi-ports'

class ESP32ValveClient implements ValveClient {
    openValve(id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    closeValve(id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export { ESP32ValveClient }
