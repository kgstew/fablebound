import { KrakenFlexOutageToOutageMapper } from '.'

describe('krakenFlexOutageToOutage', () => {
    const krakenFlexOutage = {
        id: '1',
        begin: '2022-01-01T00:00:00Z',
        end: '2022-01-02T00:00:00Z',
    }
    const expectedOutage = {
        ...krakenFlexOutage,
        begin: new Date(krakenFlexOutage.begin),
        end: new Date(krakenFlexOutage.end),
    }

    const mapper = new KrakenFlexOutageToOutageMapper()

    test('returns correctly mapped KrakenFlexSiteOutage', () => {
        expect(mapper.map(krakenFlexOutage)).toStrictEqual(expectedOutage)
    })
})
