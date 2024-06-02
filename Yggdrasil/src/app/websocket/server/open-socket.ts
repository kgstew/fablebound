import { Handler } from 'api'
import { WebSocket, WebSocketServer } from 'ws'
import { ConnectionStatus } from '../connection-status'
import { logConnectionStatus } from '../monitoring'

const webSocketConnections = {};

type Message = {
    type: string
    sendTime: string
    payload: unknown
}

const samplePneumaticsData = {
    BowPortBallastPressure: 101,
    BowPortJackPressure: 102,
    BowStarboardBallastPressure: 103,
    BowStarboardJackPressure: 104,
    SternPortBallastPressure: 6,
    SternPortJackPressure: 22,
    SternStarboardBallastPressure: 8000,
    SternStarboardJackPressure: -12,
}

// Serialize the object to a JSON string
const samplePneumaticsDataString = JSON.stringify(samplePneumaticsData);

// Create a buffer from the JSON string
const samplePneumaticsBuffer = Buffer.from(samplePneumaticsDataString);

const openSocket = async (
    port: number,
    socketName: string,
    fullConsole: Console,
    handlerMap: Record<string, Handler<unknown>>,
    connectionStatus: ConnectionStatus
): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const wss = new WebSocketServer({ port })

        wss.on('connection', (ws) => {
            fullConsole.log(`🔗 New client connected to ${socketName}`)        
            webSocketConnections[socketName] = ws;
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
            logConnectionStatus(fullConsole, connectionStatus)
            resolve(ws)

            ws.on('message', (message) => {
                console.log(
                    `📩 Received message on ${socketName} => ${message}`
                )
                connectionStatus[socketName].lastReceived =
                    new Date().toLocaleString()
                const stringMessage = message.toString()
                const parsed: Message = JSON.parse(stringMessage)
                const handler = handlerMap[parsed.type]
                console.log("got here")
                // if (!handler) {
                //     fullConsole.error(
                //         `❌ Controller not found for message type ${parsed.type}`
                //     )
                //     return
                // }
                console.log("got there")
                //handler.handle(parsed.payload)

                fullConsole.log(stringMessage)
                console.log("hey man im sending a thing")
                if (stringMessage.includes("ballast")) {
                    webSocketConnections['esp32'].send("ACTIVATE SOLENOID HOMIE")
                }
                    console.log("hey man i sent a thing")
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
                logConnectionStatus(fullConsole, connectionStatus)
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

export { openSocket }
