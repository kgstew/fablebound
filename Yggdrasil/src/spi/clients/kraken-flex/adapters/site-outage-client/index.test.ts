import { SiteOutageToKrakenFlexSiteOutageMapper } from 'spi/clients/kraken-flex/models/mappers'
import { KrakenFlexSiteOutageClient } from '.'
import { KrakenFlexApiClient } from '../../api-client'
import { SiteOutage } from 'domain/spi-ports'

describe('KrakenFlexSiteOutageClient', () => {
    const getTestProps = () => {
        const mockResults = {
            map: { example: 'mapped' },
        }

        const dependencies = {
            apiClient: {
                createManySiteOutages: jest.fn(),
            } as unknown as KrakenFlexApiClient,
            mapper: {
                map: jest.fn().mockReturnValue(mockResults.map),
            } as unknown as SiteOutageToKrakenFlexSiteOutageMapper,
        }

        const client = new KrakenFlexSiteOutageClient(
            dependencies.apiClient,
            dependencies.mapper
        )

        return { client, dependencies, mockResults }
    }

    describe('createMany', () => {
        const input = {
            siteId: 'siteId',
            siteOutages: [
                { example1: 'example1' },
                { example2: 'example2' },
            ] as unknown as SiteOutage[],
        }

        const { client, dependencies, mockResults } = getTestProps()

        test('calls dependencies with correct arguments and returns correct value', async () => {
            await expect(client.createMany(input)).resolves.toStrictEqual(
                undefined
            )

            input.siteOutages.forEach((siteOutage) => {
                expect(dependencies.mapper.map).toBeCalledWith(siteOutage)
            })
            expect(
                dependencies.apiClient.createManySiteOutages
            ).toHaveBeenCalledWith(
                input.siteId,
                Array(input.siteOutages.length).fill(mockResults.map)
            )
        })
    })
})
