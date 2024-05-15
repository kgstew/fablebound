import { AxiosInstance } from 'axios'
import { KrakenFlexApiClient } from '.'
import { KrakenFlexSiteOutage } from '../models'

describe('KrakenFlexApiClient', () => {
    const getTestProps = () => {
        const mockResults = {
            get: { data: 'exampleData' },
        }
        const axiosInstance = {
            get: jest.fn().mockResolvedValue(mockResults.get),
            post: jest.fn(),
        } as unknown as AxiosInstance

        const endpoints = {
            siteInfo: {
                getOne: '/site-info/{SITE_ID}',
            },
            outages: {
                getMany: '/outages',
            },
            siteOutages: {
                postOne: '/site-outages/{SITE_ID}',
            },
        }
        const client = new KrakenFlexApiClient(endpoints, axiosInstance)

        return {
            client,
            dependencies: {
                axiosInstance,
                endpoints,
            },
            mockResults,
        }
    }

    describe('getOneSiteInfo', () => {
        const input = 'siteId'
        const { client, dependencies, mockResults } = getTestProps()

        const expectedEndpoint = dependencies.endpoints.siteInfo.getOne.replace(
            '{SITE_ID}',
            input
        )
        const expectedResult = mockResults.get.data
        it('should call the correct endpoint and return correct data', async () => {
            const result = await client.getOneSiteInfo(input)

            expect(dependencies.axiosInstance.get).toHaveBeenCalledWith(
                expectedEndpoint
            )
            expect(result).toEqual(expectedResult)
        })
    })

    describe('getManyOutages', () => {
        const { client, dependencies, mockResults } = getTestProps()

        const expectedEndpoint = dependencies.endpoints.outages.getMany
        const expectedResult = mockResults.get.data

        it('should call the correct endpoint and return correct data', async () => {
            const result = await client.getManyOutages()

            expect(dependencies.axiosInstance.get).toHaveBeenCalledWith(
                expectedEndpoint
            )
            expect(result).toEqual(expectedResult)
        })
    })

    describe('createManySiteOutages', () => {
        const input = {
            siteId: 'siteId',
            siteOutages: [
                { exampleProp: 'exampleValue' },
            ] as unknown as KrakenFlexSiteOutage[],
        }
        const { client, dependencies } = getTestProps()

        const expectedEndpoint =
            dependencies.endpoints.siteOutages.postOne.replace(
                '{SITE_ID}',
                input.siteId
            )
        it('should call the correct endpoint with the provided siteId and siteOutages', async () => {
            await expect(
                client.createManySiteOutages(input.siteId, input.siteOutages)
            ).resolves.toBeUndefined()

            expect(dependencies.axiosInstance.post).toHaveBeenCalledWith(
                expectedEndpoint,
                input.siteOutages
            )
        })
    })
})
