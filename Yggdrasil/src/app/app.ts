import { openAllSockets } from './websockets/server/open-all-sockets'

const run = async () => {
    // runRestServer(3000, pneumaticsSystemService)
    openAllSockets()
}

export { run }
