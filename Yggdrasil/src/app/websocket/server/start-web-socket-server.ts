import { appConfig } from '../../app-config'
import { Handlers } from '../../handlers'
import { ConnectionStatus } from '../connection-status'
import { fullConsole, logConnectionStatus, tableConsole } from '../monitoring'
import { openSocket } from './open-socket'

const startWebSocketServer = async (
    config: typeof appConfig,
    handlers: Handlers
) => {
    const connectionStatus: ConnectionStatus = {}

    Object.keys(config.sockets).forEach((socketName) => {
        connectionStatus[socketName] = {
            connected: false,
            lastReceived: null,
            lastSent: null,
            lastConnected: null,
            firstConnected: null,
            uptimeLog: [],
        }
    })

    setInterval(() => logConnectionStatus(tableConsole, connectionStatus), 1000)

    const socketPromises = Object.entries(config.sockets).map(
        ([socketName, port]) => {
            console.log(
                `🔌 Opening socket ${socketName} on port ${port}...`
            )
            return openSocket(
                port,
                socketName,
                fullConsole,
                handlers,
                connectionStatus
            )
                .then(() => {
                    console.log(
                        `✅ Socket ${socketName} on port ${port} opened successfully`
                    )
                })
                .catch((error) => {
                    console.error(
                        `❌ Failed to open socket ${socketName} on port ${port}:`,
                        error
                    )
                })
        }
    )

    await Promise.all(socketPromises)
    console.log('🎉 All sockets opened successfully!')
    logConnectionStatus(tableConsole, connectionStatus)
    console.log('🚀 All WebSocket servers are up and running!')
}

export { startWebSocketServer }
