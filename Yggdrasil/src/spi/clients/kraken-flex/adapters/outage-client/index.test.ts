import { KrakenFlexOutageToOutageMapper } from 'spi/clients/kraken-flex/models/mappers'
import { KrakenFlexOutageClient } from '.'
import { KrakenFlexApiClient } from '../../api-client'

describe('KrakenFlexOutageClient', () => {
    const getTestProps = () => {
        const mockResults = {
            getManyOutages: [
                {
                    id: '1',
                    begin: '2021-12-31T23:59:99Z',
                    end: '2022-01-01T23:59:99Z',
                },
                {
                    id: '2',
                    begin: '2022-01-01T00:00:00Z',
                    end: '2022-01-01T00:00:00Z',
                },
                {
                    id: '3',
                    begin: '2022-01-01T00:00:00Z',
                    end: '2022-02-01T00:00:00Z',
                },
                {
                    id: '4',
                    begin: '2022-01-01T00:00:01Z',
                    end: '2022-01-06T00:00:01Z',
                },
            ],
        }

        const apiClient = {
            getManyOutages: jest
                .fn()
                .mockResolvedValue(mockResults.getManyOutages),
        } as unknown as KrakenFlexApiClient

        const mapper = {
            map: jest.fn().mockImplementation((krakenFlexOutage) => {
                return {
                    id: krakenFlexOutage.id,
                    begin: new Date(krakenFlexOutage.begin),
                }
            }),
        } as unknown as KrakenFlexOutageToOutageMapper
        const client = new KrakenFlexOutageClient(apiClient, mapper)

        return {
            client,
            dependencies: {
                apiClient,
                mapper,
            },
            mockResults,
        }
    }
    describe('getMany', () => {
        const input = {
            deviceIds: ['1', '2', '4'],
            startDate: new Date('2022-01-01T00:00:00Z'),
        }

        const { client, dependencies, mockResults } = getTestProps()

        const expectedResult = mockResults.getManyOutages
            .filter((outage) => {
                return (
                    new Date(outage.begin).getTime() >=
                        input.startDate.getTime() &&
                    input.deviceIds.includes(outage.id)
                )
            })
            .map(dependencies.mapper.map)
        test('returns filtered outages', async () => {
            await expect(
                client.getMany({
                    deviceIds: input.deviceIds,
                    startDate: input.startDate,
                })
            ).resolves.toStrictEqual(expectedResult)
            expect(dependencies.apiClient.getManyOutages).toBeCalledWith()
        })
    })
})
