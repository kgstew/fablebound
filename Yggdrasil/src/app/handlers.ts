import { Handler, ReadingsHandler, PneumaticsCommandHandler as PneumaticsCommandGranularHandler } from 'api'
import { appConfig } from './app-config'
import { services } from './services'

type Handlers = Record<(typeof appConfig.messages)[number], Handler<unknown>>

const handlers: Handlers = {
    espToServerSystemState: new ReadingsHandler(services.pneumaticsSystemService),
    pneumaticsCommandGranular: new PneumaticsCommandGranularHandler(services.pneumaticsSystemService),
}

export { Handlers, handlers }
