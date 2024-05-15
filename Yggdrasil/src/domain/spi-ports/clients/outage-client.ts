import { Outage } from '../../models'

interface OutageClient {
    getMany(request: {
        deviceIds: string[]
        startDate: Date
    }): Promise<Outage[]>
}

export { OutageClient }
