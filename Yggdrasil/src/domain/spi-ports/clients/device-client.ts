import { Device } from '../../models'

interface DeviceClient {
    getMany(siteId: string): Promise<Device[]>
}

export { DeviceClient }
