import { UpdateSiteOutagesApiConfig } from 'config'
import { SiteOutageService } from 'domain/'

interface UpdateSiteOutagesDependencies {
    config: UpdateSiteOutagesApiConfig
    siteOutageService: SiteOutageService
}

export { UpdateSiteOutagesDependencies }
