import { Valve } from '../../models'

class ValveService {
    async openValve(valve: Valve): Promise<void> {
        if (valve.state === 'open') {
            return
        }

        valve.state = 'open'
    }

    async closeValve(valve: Valve): Promise<void> {
        if (valve.state === 'closed') {
            return
        }

        valve.state = 'closed'
    }
}

export { ValveService }
