import { AxiosInstance } from 'axios'
import { KrakenFlexClientConfigEndpoints } from 'config'
import {
    KrakenFlexOutage,
    KrakenFlexSiteInfo,
    KrakenFlexSiteOutage,
} from '../models'

class KrakenFlexApiClient {
    constructor(
        private endpoints: KrakenFlexClientConfigEndpoints,
        private axiosClient: AxiosInstance
    ) {}

    async getOneSiteInfo(siteId: string): Promise<KrakenFlexSiteInfo> {
        const endpoint = this.endpoints.siteInfo.getOne.replace(
            '{SITE_ID}',
            siteId
        )
        const { data } = await this.axiosClient.get(endpoint)
        return data
    }

    async getManyOutages(): Promise<KrakenFlexOutage[]> {
        const { getMany: endpoint } = this.endpoints.outages
        const { data } = await this.axiosClient.get(endpoint)
        return data
    }

    async createManySiteOutages(
        siteId: string,
        siteOutages: KrakenFlexSiteOutage[]
    ): Promise<void> {
        const endpoint = this.endpoints.siteOutages.postOne.replace(
            '{SITE_ID}',
            siteId
        )
        this.axiosClient.post(endpoint, siteOutages)
    }
}

export { KrakenFlexApiClient }
