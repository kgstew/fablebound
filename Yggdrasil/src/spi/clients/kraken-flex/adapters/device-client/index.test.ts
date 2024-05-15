import { KrakenFlexDeviceClient } from '.'
import { KrakenFlexApiClient } from '../../api-client'

describe('DeviceClient', () => {
    const getTestProps = () => {
        const mockResults = {
            getOneSiteInfo: {
                exampleProp: 'exampleValue',
                devices: [
                    {
                        deviceProp: 'exampleValue1',
                    },
                    {
                        deviceProp: 'exampleValue2',
                    },
                ],
            },
        }
        const apiClient = {
            getOneSiteInfo: jest
                .fn()
                .mockResolvedValue(mockResults.getOneSiteInfo),
        } as unknown as KrakenFlexApiClient

        const client = new KrakenFlexDeviceClient(apiClient)

        return {
            client,
            dependencies: {
                apiClient,
            },
            mockResults,
        }
    }

    describe('getMany', () => {
        const input = 'siteId'
        const { client, dependencies, mockResults } = getTestProps()
        it('returns device info', async () => {
            await expect(client.getMany(input)).resolves.toStrictEqual(
                mockResults.getOneSiteInfo.devices
            )
            expect(dependencies.apiClient.getOneSiteInfo).toBeCalledWith(input)
        })
    })
})
