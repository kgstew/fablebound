import WebSocket from 'ws'
import { appConfig } from '../../app-config'

export class PixelblazeClient {
    private ws: WebSocket | null = null
    readonly name: string
    private url: string
    private reconnectAttempts: number = 0
    private maxReconnectAttempts: number = 10000
    private baseReconnectDelay: number = 1000 // Start with 1 second delay
    private reconnectTimeout: NodeJS.Timeout | null = null
    private heartbeatInterval: NodeJS.Timeout | null = null
    private lastMessageTime: number = 0
    private heartbeatTimeout: number = 60000 // 60 seconds

    constructor(name: string, url: string) {
        this.name = name
        this.url = url
    }

    connect(): void {
        if (this.ws) {
            this.ws.removeAllListeners()
            this.ws.close()
        }

        this.ws = new WebSocket(this.url)

        this.ws.on('open', () => {
            console.log(`Connected to Pixelblaze: ${this.name}`)
            this.reconnectAttempts = 0 // Reset reconnect attempts on successful connection
            this.startHeartbeat()
        })

        this.ws.on('message', (data: WebSocket.Data) => {
            //console.log(`Received message from Pixelblaze ${this.name}:`, data);
            this.lastMessageTime = Date.now()
            // Handle incoming messages here
        })

        this.ws.on('close', (code: number, reason: string) => {
            console.log(
                `Disconnected from Pixelblaze ${this.name}: ${code} - ${reason}`
            )
            this.stopHeartbeat()
            this.scheduleReconnect()
        })

        this.ws.on('error', (error: Error) => {
            console.error(`Error from Pixelblaze ${this.name}:`, error)
            // The 'close' event will be called after this, triggering a reconnection attempt
        })
    }

    private startHeartbeat(): void {
        this.stopHeartbeat() // Clear any existing interval
        this.lastMessageTime = Date.now()
        this.heartbeatInterval = setInterval(() => {
            const timeSinceLastMessage = Date.now() - this.lastMessageTime
            if (timeSinceLastMessage > this.heartbeatTimeout) {
                console.log(
                    `No message received from ${this.name} in ${this.heartbeatTimeout / 1000} seconds. Reconnecting...`
                )
                this.reconnect()
            }
        }, 5000) // Check every 5 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(
                `Max reconnect attempts reached for Pixelblaze ${this.name}. Giving up.`
            )
            return
        }

        const delay = Math.min(
            10000, // Max delay of 30 seconds
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts)
        )

        console.log(
            `Scheduling reconnection to Pixelblaze ${this.name} in ${delay}ms`
        )

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
        }

        this.reconnectTimeout = setTimeout(() => {
            console.log(`Attempting to reconnect to Pixelblaze ${this.name}`)
            this.reconnectAttempts++
            this.connect()
        }, delay)
    }

    sendVars(vars: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const varsMessage = { setVars: vars }
            this.ws.send(JSON.stringify(varsMessage))
        } else {
            console.warn(`Cannot send pattern to ${this.name}: not connected`)
        }
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }

    reconnect(): void {
        console.log(`Manually reconnecting to Pixelblaze ${this.name}`)
        if (this.ws) {
            this.ws.close()
        } else {
            this.scheduleReconnect()
        }
    }
}

export let pixelblazeClients: PixelblazeClient[] = []

export const startPixelblazeClients = () => {
    pixelblazeClients = Object.entries(appConfig.pixelblazes).map(
        ([name, url]) => {
            const client = new PixelblazeClient(name, url)
            client.connect()
            return client
        }
    )

    console.log(
        '🚀 Pixelblaze clients initialized:',
        pixelblazeClients.map((client) => client.name).join(', ')
    )
}
