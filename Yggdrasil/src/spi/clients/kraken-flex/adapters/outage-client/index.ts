import { KrakenFlexApiClient } from '../../api-client'
import { OutageClient } from 'domain/spi-ports'
import { KrakenFlexOutageToOutageMapper } from '../../models/mappers'

class KrakenFlexOutageClient implements OutageClient {
    constructor(
        private apiClient: KrakenFlexApiClient,
        private mapper: KrakenFlexOutageToOutageMapper
    ) {}

    async getMany({
        deviceIds,
        startDate,
    }: {
        deviceIds: string[]
        startDate: Date
    }) {
        const krakenFlexOutages = await this.apiClient.getManyOutages()
        const outages = krakenFlexOutages.map(this.mapper.map)
        return outages.filter(
            (outage) =>
                outage.begin.getTime() >= startDate.getTime() &&
                deviceIds.includes(outage.id)
        )
    }
}

export { KrakenFlexOutageClient }
