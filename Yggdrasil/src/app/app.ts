import { appConfig } from './app-config'
import { handlers } from './handlers'
import { startWebSocketServer } from './websocket'
import { startMidiServer } from './midi'

const run = async () => {
    startWebSocketServer(appConfig, handlers)
    startMidiServer()
}

export { run }
