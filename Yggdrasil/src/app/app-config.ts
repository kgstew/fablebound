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
    sensors: {
        pressure1: 'pressure',
        pressure2: 'pressure',
        temperature1: 'temperature',
    },
    messages: ['espToServerSystemStateBow', 'espToServerSystemStateStern', 'pneumaticsCommandGranular', 'pneumaticsCommandText', 'pneumaticsCommandPattern'] as const,
}

export { appConfig }
