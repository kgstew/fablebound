import { Device } from './device'
import { Outage } from './outage'

type SiteOutage = Outage & Pick<Device, 'name'>

export { SiteOutage }
