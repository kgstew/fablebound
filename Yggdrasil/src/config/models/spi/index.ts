interface KrakenFlexClientConfigEndpoints {
    outages: {
        getMany: string
    }
    siteInfo: {
        getOne: string
    }
    siteOutages: {
        postOne: string
    }
}

interface KrakenFlexClientConfig {
    baseUrl: string
    endpoints: KrakenFlexClientConfigEndpoints
    retry: {
        maxRetries: number
        retryableStatuses: number[]
        baseRetryInterval: number
    }
    token: string
}

interface SpiClientsConfig {
    krakenFlex: KrakenFlexClientConfig
}

interface SpiConfig {
    clients: SpiClientsConfig
}

export { KrakenFlexClientConfig, KrakenFlexClientConfigEndpoints, SpiConfig }
