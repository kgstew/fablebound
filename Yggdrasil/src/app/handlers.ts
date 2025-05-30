import {
    Handler,
    PneumaticsCommandGranularHandler,
    PneumaticsCommandTextHandler,
    PneumaticsCommandPatternHandler,
    ReadingsHandlerBow,
    ReadingsHandlerStern,
} from 'api'
import { appConfig } from './app-config'
import { services } from './services'

type Handlers = Record<(typeof appConfig.messages)[number], Handler<unknown>>

const handlers: Handlers = {
    espToServerSystemStateBow: new ReadingsHandlerBow(
        services.pneumaticsSystemService
    ),
    espToServerSystemStateStern: new ReadingsHandlerStern(
        services.pneumaticsSystemService
    ),
    pneumaticsCommandGranular: new PneumaticsCommandGranularHandler(
        services.pneumaticsSystemService
    ),
    pneumaticsCommandText: new PneumaticsCommandTextHandler(
        services.pneumaticsSystemService
    ),
    pneumaticsCommandPattern: new PneumaticsCommandPatternHandler(
        services.pneumaticsSystemService
    ),
}

export { Handlers, handlers }
