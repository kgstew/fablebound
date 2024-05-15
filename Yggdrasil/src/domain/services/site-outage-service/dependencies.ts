import { DeviceClient, OutageClient, SiteOutageClient } from '../../spi-ports'

interface SiteOutageServiceDependencies {
    outageClient: OutageClient
    deviceClient: DeviceClient
    siteOutageClient: SiteOutageClient
}

export { SiteOutageServiceDependencies }
