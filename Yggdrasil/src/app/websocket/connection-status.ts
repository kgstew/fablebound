type ConnectionStatus = Record<
    string,
    {
        connected: boolean
        lastReceived: string | null
        lastSent: string | null
        lastConnected: string | null
        firstConnected: string | null
        uptimeLog: Array<{ timestamp: number; connected: boolean }>
    }
>

export { ConnectionStatus }
