import { updateSiteOutages } from 'api'
import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { config } from 'config'
import { SiteOutageService } from 'domain/'
import {
    KrakenFlexOutageToOutageMapper,
    SiteOutageToKrakenFlexSiteOutageMapper,
} from 'spi/clients/kraken-flex/models/mappers'
import {
    KrakenFlexApiClient,
    KrakenFlexDeviceClient,
    KrakenFlexOutageClient,
    KrakenFlexSiteOutageClient,
} from 'spi'

const run = async () => {
    const getUpdateSiteOutagesDependencies = () => {
        const getSiteOutageService = (): SiteOutageService => {
            const krakenFlexClientConfig = config.get('spi.clients.krakenFlex')
            const getKrakenFlexClientAxiosInstance = (): AxiosInstance => {
                const client = axios.create({
                    baseURL: krakenFlexClientConfig.baseUrl,
                    headers: {
                        'x-api-key': krakenFlexClientConfig.token,
                    },
                })

                const { maxRetries, baseRetryInterval, retryableStatuses } =
                    krakenFlexClientConfig.retry

                axiosRetry(client, {
                    retries: maxRetries,
                    retryDelay: (retryCount) => {
                        return retryCount * baseRetryInterval
                    },
                    retryCondition: (error) => {
                        const status = error?.response?.status
                        if (!status) return false
                        return retryableStatuses.includes(status)
                    },
                })
                return client
            }
            const krakenFlexApiClient = new KrakenFlexApiClient(
                krakenFlexClientConfig.endpoints,
                getKrakenFlexClientAxiosInstance()
            )
            const deviceClient = new KrakenFlexDeviceClient(krakenFlexApiClient)
            const outageClient = new KrakenFlexOutageClient(
                krakenFlexApiClient,
                new KrakenFlexOutageToOutageMapper()
            )
            const siteOutageClient = new KrakenFlexSiteOutageClient(
                krakenFlexApiClient,
                new SiteOutageToKrakenFlexSiteOutageMapper()
            )
            return new SiteOutageService({
                deviceClient,
                outageClient,
                siteOutageClient,
            })
        }

        return {
            config: config.get('api.updateSiteOutages'),
            siteOutageService: getSiteOutageService(),
        }
    }

    await updateSiteOutages(getUpdateSiteOutagesDependencies())
}

export { run }
