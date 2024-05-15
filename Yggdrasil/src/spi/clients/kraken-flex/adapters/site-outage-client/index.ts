import { KrakenFlexApiClient } from '../../api-client'
import { SiteOutage, SiteOutageClient } from 'domain/spi-ports'
import { SiteOutageToKrakenFlexSiteOutageMapper } from '../../models/mappers'

class KrakenFlexSiteOutageClient implements SiteOutageClient {
    constructor(
        private apiClient: KrakenFlexApiClient,
        private mapper: SiteOutageToKrakenFlexSiteOutageMapper
    ) {}

    async createMany({
        siteOutages,
        siteId,
    }: {
        siteId: string
        siteOutages: SiteOutage[]
    }) {
        const krakenFlexSiteOutages = siteOutages.map((siteOutage) => {
            return this.mapper.map(siteOutage)
        })
        this.apiClient.createManySiteOutages(siteId, krakenFlexSiteOutages)
    }
}

export { KrakenFlexSiteOutageClient }
