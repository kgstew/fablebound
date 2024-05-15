import { SiteOutageToKrakenFlexSiteOutageMapper } from '.'

describe('SiteOutageToKrakenFlexSiteOutageMapper', () => {
    const siteOutage = {
        id: '1',
        begin: new Date('2022-01-01T00:00:00Z'),
        end: new Date('2022-01-02T00:00:00Z'),
        name: 'exampleName',
    }
    const expectedKrakenFlexSiteOutage = {
        ...siteOutage,
        begin: siteOutage.begin.toISOString(),
        end: siteOutage.end.toISOString(),
    }

    const mapper = new SiteOutageToKrakenFlexSiteOutageMapper()

    test('returns correctly mapped KrakenFlexSiteOutage', () => {
        expect(mapper.map(siteOutage)).toStrictEqual(
            expectedKrakenFlexSiteOutage
        )
    })
})
