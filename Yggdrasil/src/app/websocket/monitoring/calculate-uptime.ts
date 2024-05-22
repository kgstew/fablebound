const calculateUptimePercentage = (
    uptimeLog: Array<{ timestamp: number; connected: boolean }>,
    firstConnected: string | null
) => {
    if (!firstConnected) return 0
    const firstConnectedTimestamp = new Date(firstConnected).getTime()
    const now = Date.now()
    const totalDuration = now - firstConnectedTimestamp
    const uptimeDuration = uptimeLog.reduce((acc, log, index) => {
        if (log.connected) {
            const nextLog = uptimeLog[index + 1]
            const endTime = nextLog ? nextLog.timestamp : now
            return acc + (endTime - log.timestamp)
        }
        return acc
    }, 0)
    return totalDuration > 0 ? (uptimeDuration / totalDuration) * 100 : 0
}

export { calculateUptimePercentage }
