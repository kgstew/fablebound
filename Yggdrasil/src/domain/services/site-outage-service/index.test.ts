import { prop } from 'remeda'
import { SiteOutageService } from '.'

describe('SiteOutageService', () => {
    const getTestProps = () => {
        const mockResults = {
            deviceClientGetMany: [{ id: 'deviceId', name: 'deviceName' }],
            outageClientGetMany: [
                { id: 'deviceId', start: new Date(), end: new Date() },
            ],
        }
        const dependencies = {
            deviceClient: {
                getMany: jest
                    .fn()
                    .mockResolvedValue(mockResults.deviceClientGetMany),
            },
            outageClient: {
                getMany: jest
                    .fn()
                    .mockResolvedValue(mockResults.outageClientGetMany),
            },
            siteOutageClient: {
                createMany: jest.fn().mockResolvedValue(undefined),
            },
        }

        const service = new SiteOutageService(dependencies)

        return { dependencies, mockResults, service }
    }

    describe('createSiteOutages', () => {
        const input = {
            siteId: 'siteId',
            startDate: new Date(),
        }
        describe('if no devices found', () => {
            const { dependencies, service } = getTestProps()
            dependencies.deviceClient.getMany.mockResolvedValue([])
            it('should only call deviceClient.getMany', async () => {
                await expect(
                    service.createSiteOutages(input.siteId, input.startDate)
                ).resolves.toBeUndefined()

                expect(dependencies.deviceClient.getMany).toHaveBeenCalledWith(
                    input.siteId
                )

                expect(dependencies.outageClient.getMany).not.toBeCalled()

                expect(
                    dependencies.siteOutageClient.createMany
                ).not.toBeCalled()
            })
        })
        describe('if no outages found', () => {
            const { dependencies, mockResults, service } = getTestProps()
            dependencies.outageClient.getMany.mockResolvedValue([])

            it('should not call siteOutageClient.createMany', async () => {
                await expect(
                    service.createSiteOutages(input.siteId, input.startDate)
                ).resolves.toBeUndefined()

                expect(dependencies.deviceClient.getMany).toHaveBeenCalledWith(
                    input.siteId
                )
                expect(dependencies.outageClient.getMany).toBeCalledWith({
                    deviceIds: mockResults.deviceClientGetMany.map(prop('id')),
                    startDate: input.startDate,
                })
                expect(
                    dependencies.siteOutageClient.createMany
                ).not.toBeCalled()
            })
        })

        describe('if valid devices and outages found', () => {
            const { dependencies, mockResults, service } = getTestProps()
            it('should create site outages', async () => {
                await expect(
                    service.createSiteOutages(input.siteId, input.startDate)
                ).resolves.toBeUndefined()
                expect(dependencies.outageClient.getMany).toBeCalledWith({
                    deviceIds: mockResults.deviceClientGetMany.map(prop('id')),
                    startDate: input.startDate,
                })

                const getExpectedCreateMany = () => {
                    const siteOutages = mockResults.outageClientGetMany.map(
                        (outage) => {
                            const device = mockResults.deviceClientGetMany.find(
                                (device) => device.id == outage.id
                            )
                            return {
                                id: outage.id,
                                start: outage.start,
                                end: outage.end,
                                name: device?.name,
                            }
                        }
                    )
                    return { siteId: input.siteId, siteOutages }
                }
                expect(dependencies.siteOutageClient.createMany).toBeCalledWith(
                    getExpectedCreateMany()
                )
            })
        })
    })
})
