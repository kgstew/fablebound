
const appConfig = {
    sockets: {
        //charlie: 8080,
        frontend: 8078,
        esp32bow: 8071,
        esp32stern: 8072,
       // pixelBlaze1: 8081,
       // pixelBlaze2: 8082,
       // pixelBlaze3: 8083,
    },
    pixelblazes: {
        pixelblaze1: 'ws://192.168.0.111:81',
        pixelblaze2: 'ws://192.168.0.112:81',
        pixelblaze3: 'ws://192.168.0.113:81',
        pixelblaze4: 'ws://192.168.0.114:81'
    },
    sensors: {
        pressure1: 'pressure',
        pressure2: 'pressure',
        temperature1: 'temperature',
    },
    messages: ['espToServerSystemStateBow', 'espToServerSystemStateStern', 'pneumaticsCommandGranular', 'pneumaticsCommandText', 'pneumaticsCommandPattern'] as const,
}

export { appConfig }
