import { socketMap } from '../socket-map'
import { fullConsole, tableConsole } from './custom-console'
import { logConnectionStatus } from './log-connection-status'
import { connectionStatus, openSocket } from './open-socket'

const openAllSockets = async () => {
    Object.keys(socketMap).forEach((socketName) => {
        connectionStatus[socketName] = {
            connected: false,
            lastReceived: null,
            lastSent: null,
            lastConnected: null,
            firstConnected: null,
            uptimeLog: [],
        }
    })

    setInterval(() => logConnectionStatus(tableConsole), 1000)

    const socketPromises = Object.entries(socketMap).map(
        ([socketName, port]) => {
            fullConsole.log(
                `🔌 Opening socket ${socketName} on port ${port}...`
            )
            return openSocket(port, socketName, fullConsole)
                .then(() => {
                    fullConsole.log(
                        `✅ Socket ${socketName} on port ${port} opened successfully`
                    )
                })
                .catch((error) => {
                    fullConsole.error(
                        `❌ Failed to open socket ${socketName} on port ${port}:`,
                        error
                    )
                })
        }
    )

    await Promise.all(socketPromises)
    fullConsole.log('🎉 All sockets opened successfully!')
    logConnectionStatus(tableConsole)
    fullConsole.log('🚀 All WebSocket servers are up and running!')
}

export { openAllSockets }
