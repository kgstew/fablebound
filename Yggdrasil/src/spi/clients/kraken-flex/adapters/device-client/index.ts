import { KrakenFlexApiClient } from '../../api-client'
import { DeviceClient } from 'domain/spi-ports'

class KrakenFlexDeviceClient implements DeviceClient {
    constructor(private apiClient: KrakenFlexApiClient) {}
    async getMany(siteId: string) {
        const siteInfo = await this.apiClient.getOneSiteInfo(siteId)
        return siteInfo.devices
    }
}

export { KrakenFlexDeviceClient }
