import { WebSocket, WebSocketServer } from 'ws'
import { logConnectionStatus } from './log-connection-status'

const connectionStatus: Record<
    string,
    {
        connected: boolean
        lastReceived: string | null
        lastSent: string | null
        lastConnected: string | null
        firstConnected: string | null
        uptimeLog: Array<{ timestamp: number; connected: boolean }>
    }
> = {}

const openSocket = async (
    port: number,
    socketName: string,
    fullConsole: Console
): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const wss = new WebSocketServer({ port })

        wss.on('connection', (ws) => {
            fullConsole.log(`🔗 New client connected to ${socketName}`)
            connectionStatus[socketName].connected = true
            connectionStatus[socketName].lastConnected = null
            if (!connectionStatus[socketName].firstConnected) {
                connectionStatus[socketName].firstConnected =
                    new Date().toLocaleString()
            }
            connectionStatus[socketName].uptimeLog.push({
                timestamp: Date.now(),
                connected: true,
            })
            logConnectionStatus(fullConsole)
            resolve(ws)

            ws.on('message', (message) => {
                fullConsole.log(
                    `📩 Received message on ${socketName} => ${message}`
                )
                connectionStatus[socketName].lastReceived =
                    new Date().toLocaleString()
                const stringMessage = message.toString()
                fullConsole.log(stringMessage)
                ws.send(`Hello, you sent -> ${message}`)
                connectionStatus[socketName].lastSent =
                    new Date().toLocaleString()
            })

            ws.on('close', () => {
                fullConsole.log(`🔒 Client has disconnected from ${socketName}`)
                connectionStatus[socketName].connected = false
                connectionStatus[socketName].lastConnected =
                    new Date().toLocaleString()
                connectionStatus[socketName].uptimeLog.push({
                    timestamp: Date.now(),
                    connected: false,
                })
                logConnectionStatus(fullConsole)
            })

            ws.on('error', (error) => {
                fullConsole.error(`⚠️ WebSocket error on ${socketName}:`, error)
                reject(error)
            })
        })

        wss.on('error', (error) => {
            fullConsole.error(
                `⚠️ WebSocket server error on ${socketName}:`,
                error
            )
            reject(error)
        })

        fullConsole.log(
            `🚀 WebSocket server for ${socketName} is running on ws://localhost:${port}`
        )
    })
}

export { connectionStatus, openSocket }
