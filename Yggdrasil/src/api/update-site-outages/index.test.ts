import { updateSiteOutages } from '.'
import { UpdateSiteOutagesDependencies } from './dependencies'

describe('updateSiteOutages', () => {
    const siteId = 'testSiteId'
    const startDate = '2022-01-01'
    const dependencies: UpdateSiteOutagesDependencies = {
        config: { siteId, startDate },
        siteOutageService: {
            createSiteOutages: jest.fn(),
        },
    } as unknown as UpdateSiteOutagesDependencies

    it('should call createSiteOutages with correct arguments', async () => {
        await updateSiteOutages(dependencies)
        expect(
            dependencies.siteOutageService.createSiteOutages
        ).toHaveBeenCalledWith(siteId, new Date(startDate))
    })
})
