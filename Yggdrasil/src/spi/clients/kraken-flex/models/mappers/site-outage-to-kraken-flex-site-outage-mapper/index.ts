import { SiteOutage } from 'domain/spi-ports'
import { Mapper } from '../mapper'
import { KrakenFlexSiteOutage } from '../../site-outage'

class SiteOutageToKrakenFlexSiteOutageMapper
    implements Mapper<SiteOutage, KrakenFlexSiteOutage>
{
    map(from: SiteOutage): KrakenFlexSiteOutage {
        return {
            ...from,
            begin: from.begin.toISOString(),
            end: from.end.toISOString(),
        }
    }
}
export { SiteOutageToKrakenFlexSiteOutageMapper }
