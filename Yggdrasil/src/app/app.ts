import { appConfig } from './app-config'
import { handlers } from './handlers'
import { startWebSocketServer } from './websocket'
import { startMidiServer } from './midi'
import { startPixelblazeClients } from './pixelblaze/clients/pixelblaze-clients'

const run = async () => {
    startWebSocketServer(appConfig, handlers)
    startMidiServer()
    startPixelblazeClients()
}

export { run }
