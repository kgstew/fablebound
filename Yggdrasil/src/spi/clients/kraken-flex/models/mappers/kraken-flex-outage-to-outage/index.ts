import { KrakenFlexOutage } from '../../outage'
import { Mapper } from '../mapper'
import { Outage } from 'domain/spi-ports'

class KrakenFlexOutageToOutageMapper
    implements Mapper<KrakenFlexOutage, Outage>
{
    map(from: KrakenFlexOutage): Outage {
        return {
            ...from,
            begin: new Date(from.begin),
            end: new Date(from.end),
        }
    }
}
export { KrakenFlexOutageToOutageMapper }
