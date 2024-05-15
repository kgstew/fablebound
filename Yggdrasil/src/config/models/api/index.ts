interface UpdateSiteOutagesApiConfig {
    siteId: string
    startDate: string
}

interface ApiConfig {
    updateSiteOutages: UpdateSiteOutagesApiConfig
}

export { ApiConfig, UpdateSiteOutagesApiConfig }
