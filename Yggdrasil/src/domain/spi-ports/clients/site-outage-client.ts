import { SiteOutage } from '../../models'

interface SiteOutageClient {
    createMany(request: {
        siteId: string
        siteOutages: SiteOutage[]
    }): Promise<void>
}

export { SiteOutageClient }
