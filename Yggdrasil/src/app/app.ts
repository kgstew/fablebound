import { appConfig } from './app-config'
import { handlers } from './handlers'
import { startWebSocketServer } from './websocket'

const run = async () => {
    startWebSocketServer(appConfig, handlers)
}

export { run }
