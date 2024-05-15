import { SiteOutageServiceDependencies } from './dependencies'

class SiteOutageService {
    constructor(private dependencies: SiteOutageServiceDependencies) {}

    async createSiteOutages(siteId: string, startDate: Date): Promise<void> {
        const { deviceClient, outageClient, siteOutageClient } =
            this.dependencies

        const devices = await deviceClient.getMany(siteId)

        if (!devices.length) {
            return
        }

        const deviceIdsToName = devices.reduce<Record<string, string>>(
            (acc, device) => ({ ...acc, [device.id]: device.name }),
            {}
        )

        const outages = await outageClient.getMany({
            deviceIds: Object.keys(deviceIdsToName),
            startDate,
        })

        if (!outages.length) {
            return
        }

        const siteOutages = outages.map((outage) => ({
            ...outage,
            name: deviceIdsToName[outage.id],
        }))

        return siteOutageClient.createMany({ siteId, siteOutages })
    }
}

export { SiteOutageService }
