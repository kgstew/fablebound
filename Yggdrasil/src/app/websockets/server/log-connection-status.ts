import { calculateUptimePercentage } from './calculate-uptime'
import { connectionStatus } from './open-socket'

const logConnectionStatus = (tableConsole: Console) => {
    const timestamp = new Date().toLocaleString()
    tableConsole.log(`📊 Connection Status at ${timestamp}:`)

    const statusTable = Object.entries(connectionStatus).map(
        ([socketName, status]) => {
            const uptimePercentage = calculateUptimePercentage(
                status.uptimeLog,
                status.firstConnected
            )
            return {
                'Socket Name': socketName,
                'Connection Status': status.connected ? '✅' : '❌',
                'First Connected': status.firstConnected || '',
                'Last Disconnected': status.connected
                    ? ''
                    : status.lastConnected || '',
                'Last Received': status.lastReceived || '',
                'Last Sent': status.lastSent || '',
                'Uptime Percentage (Since First Connected)': `${uptimePercentage.toFixed(2)}%`,
            }
        }
    )

    tableConsole.table(statusTable)
}

export { logConnectionStatus }
