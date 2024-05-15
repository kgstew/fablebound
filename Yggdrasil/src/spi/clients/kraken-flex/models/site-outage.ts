import { KrakenFlexDevice } from './device'
import { KrakenFlexOutage } from './outage'

type KrakenFlexSiteOutage = KrakenFlexOutage & Pick<KrakenFlexDevice, 'name'>

export { KrakenFlexSiteOutage }
