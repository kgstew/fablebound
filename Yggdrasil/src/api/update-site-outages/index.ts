import { UpdateSiteOutagesDependencies } from './dependencies'

const updateSiteOutages = async (
    dependencies: UpdateSiteOutagesDependencies
): Promise<void> => {
    const { siteId, startDate } = dependencies.config
    console.log(
        `🚀 Updating site outages...\n🚀 Site id: ${siteId}...\n🚀 Start date: ${startDate}...\n...`
    )
    await dependencies.siteOutageService.createSiteOutages(
        siteId,
        new Date(startDate)
    )
    console.log(`🏁 Job finished`)
}

export { updateSiteOutages }
