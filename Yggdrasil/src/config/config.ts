import convict from 'convict'
import { Config } from './models'

const config = convict<Config>({
    api: {
        updateSiteOutages: {
            siteId: {
                default: 'norwich-pear-tree',
                env: 'UPDATE_SITE_OUTAGES_SITE_ID',
            },
            startDate: {
                default: '2022-01-01T00:00:00.000Z',
                env: 'UPDATE_SITE_OUTAGES_START_DATE',
            },
        },
    },
    spi: {
        clients: {
            krakenFlex: {
                baseUrl: {
                    default:
                        'https://api.krakenflex.systems/interview-tests-mock-api/v1',
                },
                endpoints: {
                    outages: {
                        getMany: {
                            default: '/outages',
                        },
                    },
                    siteInfo: {
                        getOne: {
                            default: '/site-info/{SITE_ID}',
                        },
                    },
                    siteOutages: {
                        postOne: {
                            default: '/site-outages/{SITE_ID}',
                        },
                    },
                },
                retry: {
                    maxRetries: {
                        default: 3,
                    },
                    retryableStatuses: {
                        default: [500],
                    },
                    baseRetryInterval: {
                        default: 2_000,
                    },
                },
                token: {
                    default: '',
                    env: 'KRAKENFLEX_TOKEN',
                },
            },
        },
    },
})

config.validate()

export { config }
