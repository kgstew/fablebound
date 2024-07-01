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
            console.log(`🔗 New client connected to ${socketName}`)        
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
                console.log(`📩 Received message on ${socketName} => ${message}`);
                connectionStatus[socketName].lastReceived = new Date().toLocaleString();
            
                const stringMessage = message.toString();
                let parsed;
            
                try {

                    parsed = parseJsonMessage(stringMessage, parsed);
            
                console.log(
                    `📩 Received message on ${socketName} => ${parsed}`
                )
                connectionStatus[socketName].lastReceived =
                    new Date().toLocaleString()
                
                const handler = handlerMap[parsed.type]
                if (!handler) {
                    console.error(
                        `❌ Controller not found for message type ${parsed.type}`
                    )
                    return
                }
                handler.handle(parsed)

                connectionStatus[socketName].lastSent =
                    new Date().toLocaleString()
                }catch (error) {
                    console.error("An error occurred:", error);
                }
            })

            ws.on('close', () => {
                console.log(`🔒 Client has disconnected from ${socketName}`)
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
                console.error(`⚠️ WebSocket error on ${socketName}:`, error)
                reject(error)
            })
        })

        wss.on('error', (error) => {
            console.error(
                `⚠️ WebSocket server error on ${socketName}:`,
                error
            )
            reject(error)
        })

        console.log(
            `🚀 WebSocket server for ${socketName} is running on ws://localhost:${port}`
        )
    })
}


function parseJsonMessage(stringMessage: string, parsed: any) {
    const jsonObj = JSON.parse(stringMessage);

    // Check for double-encoded JSON and parse if necessary
    if (typeof jsonObj.message === 'string') {
        // The message is a string, implying it's double-encoded JSON
        try {
            const innerJson = JSON.parse(jsonObj.message);
            if (innerJson.type) {
                parsed = innerJson; // Properly formatted message from double-encoded JSON
            } else {
                // Default handling if inner JSON does not contain 'type'
                parsed = { type: 'defaultType', payload: innerJson };
            }
        } catch (innerError) {
            console.error('Error parsing double-encoded JSON:', innerError);
            parsed = { type: 'defaultType', payload: jsonObj.message };
        }
    } else if (jsonObj.type) {
        // Direct format where 'type' is at the root level of JSON
        parsed = jsonObj;
    } else {
        // Assume payload is the entire JSON if no type is directly present
        parsed = {
            type: jsonObj.type || 'defaultType', // Provide a default or extract appropriately
            payload: jsonObj
        };
    }
    return parsed;
}



export { openSocket, webSocketConnections }
