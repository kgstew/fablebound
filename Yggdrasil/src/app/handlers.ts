import { Handler, ReadingsHandler } from 'api'
import { appConfig } from './app-config'
import { services } from './services'

type Handlers = Record<(typeof appConfig.messages)[number], Handler<unknown>>

const handlers: Handlers = {
    readings: new ReadingsHandler(services.pneumaticsSystemService),
}

export { Handlers, handlers }
