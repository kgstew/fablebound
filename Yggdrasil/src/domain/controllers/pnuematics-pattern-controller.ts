import { PneumaticsController } from './pneumatics-controller'
import {
    PneumaticsCommandPattern,
    PneumaticsCommandPatternName,
    PneumaticsCommandPatternMap,
    PressureSettingsOverTime,
} from './types'
import { randomInt } from 'crypto'

export class PneumaticsPatternController {
    private pneumaticsController: PneumaticsController
    public currentPattern: PneumaticsCommandPattern | null = null
    private patterns: PneumaticsCommandPatternMap = new Map()
    private isRunning: boolean = false
    private stopRequested: boolean = false
    private patternSwitchRequested: boolean = false
    private currentPatternExecution: Promise<void> | null = null
    private patternStartTime: number = 0
    private inPatternTimeMarker: number = 0

    constructor(pneumaticsController: PneumaticsController) {
        this.pneumaticsController = pneumaticsController
        this.initializePatterns()
    }

    public notifyPatternChange(
        patternName: PneumaticsCommandPatternName | null
    ) {
        // This method is implemented in PneumaticsModelSingleton
    }

    private initializePatterns() {
        this.patterns.set('calibrateDistance', {
            name: 'calibrateDistance',
            pressureSettings: {
                ballastTankMaxPressure: 34,
                maxPistonPressure: 25,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget(
                    'bowStarboard',
                    100,
                    'percent'
                )
                await controller.setMovementTarget(
                    'sternStarboard',
                    100,
                    'percent'
                )
                await controller.setMovementTarget('bowPort', 100, 'percent')
                await controller.setMovementTarget('sternPort', 100, 'percent')
                await this.sleep(randomInt(2000, 3000), shouldStop)
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 0, 'percent')
                await controller.setMovementTarget(
                    'sternStarboard',
                    0,
                    'percent'
                )
                await controller.setMovementTarget('bowPort', 0, 'percent')
                await controller.setMovementTarget('sternPort', 0, 'percent')
                await this.sleep(randomInt(2000, 3000), shouldStop)
                if (shouldStop()) return
            },
        }),
            this.patterns.set('inPort', {
                name: 'inPort',
                pressureSettings: {
                    ballastTankMaxPressure: 34,
                    maxPistonPressure: 25,
                    minPistonPressure: 22,
                },
                main: async (controller, shouldStop) => {
                    if (shouldStop()) return
                    await controller.setMovementTarget(
                        'bowStarboard',
                        100,
                        'percent'
                    )
                    await controller.setMovementTarget(
                        'sternStarboard',
                        100,
                        'percent'
                    )
                    await controller.setMovementTarget('bowPort', 0, 'percent')
                    await controller.setMovementTarget(
                        'sternPort',
                        0,
                        'percent'
                    )
                    await this.sleep(randomInt(2000, 3000), shouldStop)
                    if (shouldStop()) return
                    await controller.setMovementTarget(
                        'bowStarboard',
                        0,
                        'percent'
                    )
                    await controller.setMovementTarget(
                        'sternStarboard',
                        0,
                        'percent'
                    )
                    await controller.setMovementTarget(
                        'bowPort',
                        100,
                        'percent'
                    )
                    await controller.setMovementTarget(
                        'sternPort',
                        100,
                        'percent'
                    )
                    await this.sleep(randomInt(2000, 3000), shouldStop)
                    if (shouldStop()) return
                },
            })
        this.patterns.set('setOutOnAdventure', {
            name: 'setOutOnAdventure',
            pressureSettings: {
                ballastTankMaxPressure: 38,
                maxPistonPressure: 27,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget(
                    'bowStarboard',
                    100,
                    'percent'
                )
                await controller.setMovementTarget('bowPort', 0, 'percent')
                await controller.setMovementTarget(
                    'sternStarboard',
                    100,
                    'percent'
                )
                await controller.setMovementTarget('sternPort', 0, 'percent')
                await this.sleep(randomInt(3000, 4000), shouldStop)
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 0, 'percent')
                await controller.setMovementTarget('bowPort', 100, 'percent')
                await controller.setMovementTarget(
                    'sternStarboard',
                    0,
                    'percent'
                )
                await controller.setMovementTarget('sternPort', 100, 'percent')
                await this.sleep(randomInt(3000, 4000), shouldStop)
                if (shouldStop()) return
            },
        })
        this.patterns.set('intoTheUnknown', {
            name: 'intoTheUnknown',
            pressureSettings: {
                ballastTankMaxPressure: 44,
                maxPistonPressure: 28,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                await this.starboardWave(controller, shouldStop)
                if (shouldStop()) return
            },
        })
        this.patterns.set('risingStorm', {
            name: 'risingStorm',
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 29,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                this.patternStartTime = Date.now()
                const pressureIncreases: PressureSettingsOverTime = {
                    0: {
                        ballastTankMaxPressure: 60,
                        maxPistonPressure: 29,
                        minPistonPressure: 22,
                    },
                    30000: {
                        ballastTankMaxPressure: 60,
                        maxPistonPressure: 30,
                        minPistonPressure: 22,
                    },
                    60000: {
                        ballastTankMaxPressure: 65,
                        maxPistonPressure: 31,
                        minPistonPressure: 22,
                    },
                    90000: {
                        ballastTankMaxPressure: 65,
                        maxPistonPressure: 32,
                        minPistonPressure: 22,
                    },
                }
                while (!shouldStop()) {
                    if (shouldStop()) return
                    const side = this.chooseRandomSide()
                    if (side === 'starboard') {
                        await this.starboardWave(controller, shouldStop)
                        if (shouldStop()) return
                    } else {
                        await this.portWave(controller, shouldStop)
                        if (shouldStop()) return
                    }
                    let newPressureSettings = pressureIncreases[0]
                    Object.entries(pressureIncreases).forEach(
                        ([timeElapsed, settings]) => {
                            if (
                                Date.now() - this.patternStartTime >
                                parseInt(timeElapsed)
                            ) {
                                newPressureSettings = settings
                            }
                        }
                    )
                    controller.updatePressureSettings(newPressureSettings)
                    if (shouldStop()) return
                }
            },
        })
        this.patterns.set('stormySeas', {
            name: 'stormySeas',
            pressureSettings: {
                ballastTankMaxPressure: 65,
                maxPistonPressure: 32,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                this.patternStartTime = Date.now()
                this.inPatternTimeMarker = 110000
                const pressureIncreases: PressureSettingsOverTime = {
                    0: {
                        ballastTankMaxPressure: 70,
                        maxPistonPressure: 32,
                        minPistonPressure: 22,
                    },
                    30000: {
                        ballastTankMaxPressure: 70,
                        maxPistonPressure: 32,
                        minPistonPressure: 22,
                    },
                    60000: {
                        ballastTankMaxPressure: 70,
                        maxPistonPressure: 33,
                        minPistonPressure: 22,
                    },
                    90000: {
                        ballastTankMaxPressure: 70,
                        maxPistonPressure: 33,
                        minPistonPressure: 22,
                    },
                }
                while (
                    !this.stopRequested &&
                    Date.now() - this.patternStartTime <
                        this.inPatternTimeMarker
                ) {
                    if (shouldStop()) return
                    const timeElapsed = Date.now() - this.patternStartTime
                    if (timeElapsed > 60000) {
                        await this.bigCrashyWave(controller, shouldStop)
                        if (shouldStop()) return
                    } else if (Math.random() < 0.5) {
                        await this.starboardWave(controller, shouldStop)
                        if (shouldStop()) return
                    } else {
                        await this.portWave(controller, shouldStop)
                        if (shouldStop()) return
                    }
                    let newPressureSettings = pressureIncreases[0]
                    Object.entries(pressureIncreases).forEach(
                        ([timeElapsed, settings]) => {
                            if (
                                Date.now() - this.patternStartTime >
                                parseInt(timeElapsed)
                            ) {
                                newPressureSettings = settings
                            }
                        }
                    )
                    if (shouldStop()) return
                    controller.updatePressureSettings(newPressureSettings)
                }
                while (
                    !this.stopRequested &&
                    Date.now() - this.patternStartTime >=
                        this.inPatternTimeMarker
                ) {
                    if (shouldStop()) return
                    await this.allPistonsToLowestPoint(controller)
                    await this.sleep(randomInt(2000, 3200), shouldStop) // Small delay to prevent excessive CPU usage
                }
            },
        })
        this.patterns.set('meetTheGods', {
            name: 'meetTheGods',
            pressureSettings: {
                ballastTankMaxPressure: 50,
                maxPistonPressure: 33,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                let initialSequenceCompleted = false

                while (!shouldStop()) {
                    if (!initialSequenceCompleted) {
                        await this.sleep(2000, shouldStop)

                        // Raise bow
                        await controller.setMovementTarget(
                            'bowStarboard',
                            33,
                            'psi'
                        )
                        await controller.setMovementTarget('bowPort', 33, 'psi')
                        await controller.setMovementTarget(
                            'sternPort',
                            22,
                            'psi'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            22,
                            'psi'
                        )
                        if (shouldStop()) return
                        await this.sleep(2400, shouldStop)

                        // Raise stern
                        await controller.setMovementTarget(
                            'bowStarboard',
                            33,
                            'psi'
                        )
                        await controller.setMovementTarget('bowPort', 33, 'psi')
                        await controller.setMovementTarget(
                            'sternPort',
                            33,
                            'psi'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            33,
                            'psi'
                        )
                        if (shouldStop()) return
                        await this.sleep(4000, shouldStop)

                        initialSequenceCompleted = true
                    }

                    // Set and maintain pressure at 30 PSI for all legs
                    await controller.setMovementTarget(
                        'bowStarboard',
                        33,
                        'psi'
                    )
                    await controller.setMovementTarget('bowPort', 33, 'psi')
                    await controller.setMovementTarget('sternPort', 33, 'psi')
                    await controller.setMovementTarget(
                        'sternStarboard',
                        33,
                        'psi'
                    )
                    if (shouldStop()) return
                    await this.sleep(5000, shouldStop)

                    await controller.handleCommand({
                        type: 'pneumaticsCommandText',
                        command: 'holdPosition',
                        sendTime: new Date().toLocaleString(),
                    })
                    if (shouldStop()) return
                    await this.sleep(1000, shouldStop)
                }
            },
        })
        this.patterns.set('trickstersPromise', {
            name: 'trickstersPromise',
            pressureSettings: {
                ballastTankMaxPressure: 40,
                maxPistonPressure: 32,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                this.patternStartTime = Date.now()
                this.inPatternTimeMarker = 170000

                while (
                    !shouldStop() &&
                    Date.now() - this.patternStartTime <
                        this.inPatternTimeMarker
                ) {
                    await controller.setMovementTarget(
                        'bowStarboard',
                        70,
                        'percent'
                    )
                    await controller.setMovementTarget('bowPort', 70, 'percent')
                    await controller.setMovementTarget(
                        'sternPort',
                        70,
                        'percent'
                    )
                    await controller.setMovementTarget(
                        'sternStarboard',
                        70,
                        'percent'
                    )
                    if (shouldStop()) return
                    if (
                        Date.now() - this.patternStartTime >
                        this.inPatternTimeMarker
                    )
                        break
                    await this.sleep(randomInt(2000, 3700), shouldStop)

                    const randomSelection = randomInt(0, 2)

                    // front to back
                    if (randomSelection === 0) {
                        await controller.setMovementTarget(
                            'bowStarboard',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'bowPort',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternPort',
                            60,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            60,
                            'percent'
                        )
                        if (shouldStop()) return
                        if (
                            Date.now() - this.patternStartTime >
                            this.inPatternTimeMarker
                        )
                            break
                        await this.sleep(randomInt(2000, 3200), shouldStop)
                        await controller.setMovementTarget(
                            'bowStarboard',
                            60,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'bowPort',
                            60,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternPort',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            80,
                            'percent'
                        )
                        if (shouldStop()) return
                        if (
                            Date.now() - this.patternStartTime >
                            this.inPatternTimeMarker
                        )
                            break
                        await this.sleep(randomInt(2000, 3200), shouldStop)
                    }
                    // side to side
                    else if (randomSelection === 1) {
                        await controller.setMovementTarget(
                            'bowStarboard',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'bowPort',
                            60,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternPort',
                            60,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            80,
                            'percent'
                        )
                        if (shouldStop()) return
                        if (
                            Date.now() - this.patternStartTime >
                            this.inPatternTimeMarker
                        )
                            break
                        await this.sleep(randomInt(2000, 3200), shouldStop)

                        await controller.setMovementTarget(
                            'bowStarboard',
                            60,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'bowPort',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternPort',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            60,
                            'percent'
                        )
                        if (shouldStop()) return
                        if (
                            Date.now() - this.patternStartTime >
                            this.inPatternTimeMarker
                        )
                            break
                        await this.sleep(randomInt(2000, 3200), shouldStop)
                    }
                    // High-intensity fall
                    else if (randomSelection === 2) {
                        await controller.setMovementTarget(
                            'bowStarboard',
                            50,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'bowPort',
                            50,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternPort',
                            50,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            50,
                            'percent'
                        )
                        if (shouldStop()) return
                        if (
                            Date.now() - this.patternStartTime >
                            this.inPatternTimeMarker
                        )
                            break
                        await this.sleep(randomInt(1000, 2000), shouldStop)

                        await controller.setMovementTarget(
                            'bowStarboard',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'bowPort',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternPort',
                            80,
                            'percent'
                        )
                        await controller.setMovementTarget(
                            'sternStarboard',
                            80,
                            'percent'
                        )
                        if (shouldStop()) return
                        if (
                            Date.now() - this.patternStartTime >
                            this.inPatternTimeMarker
                        )
                            break
                        await this.sleep(randomInt(2000, 3200), shouldStop)
                    }

                    if (shouldStop()) return
                    if (
                        Date.now() - this.patternStartTime >
                        this.inPatternTimeMarker
                    )
                        break
                    await this.sleep(randomInt(2000, 3200), shouldStop) // Small delay to prevent excessive CPU usage
                }

                // Finish with all pistons at highest point
                while (
                    !this.stopRequested &&
                    Date.now() - this.patternStartTime >=
                        this.inPatternTimeMarker
                ) {
                    if (shouldStop()) return
                    await this.allPistonsToHighestPoint(controller)
                    await this.sleep(randomInt(2000, 3200), shouldStop) // Small delay to prevent excessive CPU usage
                }
            },
        })
        this.patterns.set('arrivingHome', {
            name: 'arrivingHome',
            pressureSettings: {
                ballastTankMaxPressure: 60,
                maxPistonPressure: 32,
                minPistonPressure: 22,
            },
            main: async (controller, shouldStop) => {
                // Drop the boat!!
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerBow', sendTime: new Date().toLocaleString() });
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'lowerStern', sendTime: new Date().toLocaleString() });
                await this.allPistonsToLowestPoint(controller)
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'holdPosition',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.allPistonsToHighestPoint(controller)
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseBow', sendTime: new Date().toLocaleString() });
                //await controller.handleCommand({ type: 'pneumaticsCommandText', command: 'raiseStern', sendTime: new Date().toLocaleString() });
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'holdPosition',
                    sendTime: new Date().toLocaleString(),
                })
            },
        })
        this.patterns.set('upDownUpDown', {
            name: 'upDownUpDown',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'raiseBow',
                    sendTime: new Date().toLocaleString(),
                })
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'raiseStern',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'holdPosition',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'lowerBow',
                    sendTime: new Date().toLocaleString(),
                })
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'lowerStern',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'holdPosition',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('ventEverything', {
            name: 'ventEverything',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'ventAll',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('closeAllValves', {
            name: 'closeAllValves',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'closeAllValves',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('maintainBaseline', {
            name: 'maintainBaseline',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.handleCommand({
                    type: 'pneumaticsCommandText',
                    command: 'none',
                    sendTime: new Date().toLocaleString(),
                })
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure10', {
            name: 'setPressure10',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 10, 'psi')
                await controller.setMovementTarget('bowPort', 10, 'psi')
                await controller.setMovementTarget('sternPort', 10, 'psi')
                await controller.setMovementTarget('sternStarboard', 10, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure12', {
            name: 'setPressure12',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 12, 'psi')
                await controller.setMovementTarget('bowPort', 12, 'psi')
                await controller.setMovementTarget('sternPort', 12, 'psi')
                await controller.setMovementTarget('sternStarboard', 12, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure15', {
            name: 'setPressure15',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 15, 'psi')
                await controller.setMovementTarget('bowPort', 15, 'psi')
                await controller.setMovementTarget('sternPort', 15, 'psi')
                await controller.setMovementTarget('sternStarboard', 15, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure17', {
            name: 'setPressure17',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 17, 'psi')
                await controller.setMovementTarget('bowPort', 17, 'psi')
                await controller.setMovementTarget('sternPort', 17, 'psi')
                await controller.setMovementTarget('sternStarboard', 17, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure20', {
            name: 'setPressure20',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 20, 'psi')
                await controller.setMovementTarget('bowPort', 20, 'psi')
                await controller.setMovementTarget('sternPort', 20, 'psi')
                await controller.setMovementTarget('sternStarboard', 20, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure22', {
            name: 'setPressure22',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 22, 'psi')
                await controller.setMovementTarget('bowPort', 22, 'psi')
                await controller.setMovementTarget('sternPort', 22, 'psi')
                await controller.setMovementTarget('sternStarboard', 22, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure25', {
            name: 'setPressure25',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 25, 'psi')
                await controller.setMovementTarget('bowPort', 25, 'psi')
                await controller.setMovementTarget('sternPort', 25, 'psi')
                await controller.setMovementTarget('sternStarboard', 25, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure27', {
            name: 'setPressure27',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 27, 'psi')
                await controller.setMovementTarget('bowPort', 27, 'psi')
                await controller.setMovementTarget('sternPort', 27, 'psi')
                await controller.setMovementTarget('sternStarboard', 27, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })
        this.patterns.set('setPressure30', {
            name: 'setPressure30',
            main: async (controller, shouldStop) => {
                if (shouldStop()) return
                await controller.setMovementTarget('bowStarboard', 30, 'psi')
                await controller.setMovementTarget('bowPort', 30, 'psi')
                await controller.setMovementTarget('sternPort', 30, 'psi')
                await controller.setMovementTarget('sternStarboard', 30, 'psi')
                if (shouldStop()) return
                await this.sleep(1000, shouldStop)
            },
        })

        // Add more patterns here
    }

    private async starboardWave(
        controller: PneumaticsController,
        shouldStop: () => boolean
    ) {
        console.log('starboardWave')
        await controller.setMovementTarget('bowStarboard', 90, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Raise port bow slightly and starboard stern
        await controller.setMovementTarget('bowPort', 60, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return

        await controller.setMovementTarget('sternStarboard', 70, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Lower starboard bow, raise port stern
        await controller.setMovementTarget('bowStarboard', 30, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return

        await controller.setMovementTarget('sternPort', 80, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Lower port bow and starboard stern
        await controller.setMovementTarget('bowPort', 20, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return

        await controller.setMovementTarget('sternStarboard', 20, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Lower port stern
        await controller.setMovementTarget('sternPort', 20, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return
    }

    private async portWave(
        controller: PneumaticsController,
        shouldStop: () => boolean
    ) {
        console.log('portWave')
        await controller.setMovementTarget('bowPort', 90, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Raise port bow slightly and starboard stern
        await controller.setMovementTarget('bowStarboard', 60, 'percent')
        await this.sleep(randomInt(1000, 2000), shouldStop)
        if (shouldStop()) return

        await controller.setMovementTarget('sternPort', 70, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Lower starboard bow, raise port stern
        await controller.setMovementTarget('bowPort', 30, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return

        await controller.setMovementTarget('sternStarboard', 80, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Lower port bow and starboard stern
        await controller.setMovementTarget('bowStarboard', 20, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return

        await controller.setMovementTarget('sternPort', 20, 'percent')
        await this.sleep(randomInt(1000, 2400), shouldStop)
        if (shouldStop()) return

        // Lower port stern
        await controller.setMovementTarget('sternStarboard', 20, 'percent')
        await this.sleep(randomInt(800, 1700), shouldStop)
        if (shouldStop()) return
    }

    private async bigCrashyWave(
        controller: PneumaticsController,
        shouldStop: () => boolean
    ) {
        //raise the bow and drop the stern
        if (Math.random() < 0.5) {
            await controller.setMovementTarget('bowPort', 100, 'percent')
            await controller.setMovementTarget('bowStarboard', 75, 'percent')
            if (Math.random() < 0.5) {
                await controller.setMovementTarget('sternPort', 0, 'percent')
                await controller.setMovementTarget(
                    'sternStarboard',
                    25,
                    'percent'
                )
            } else {
                await controller.setMovementTarget('sternPort', 25, 'percent')
                await controller.setMovementTarget(
                    'sternStarboard',
                    0,
                    'percent'
                )
            }
            if (shouldStop()) return
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker)
                return
            await this.sleep(randomInt(1200, 2500), shouldStop)
        } else {
            await controller.setMovementTarget('bowPort', 75, 'percent')
            await controller.setMovementTarget('bowStarboard', 100, 'percent')
            if (shouldStop()) return
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker)
                return
            await this.sleep(randomInt(1200, 2500), shouldStop)
        }

        //raise the stern
        if (Math.random() < 0.5) {
            await controller.setMovementTarget('sternPort', 100, 'percent')
            await controller.setMovementTarget('sternStarboard', 75, 'percent')
            if (shouldStop()) return
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker)
                return
            await this.sleep(randomInt(1200, 2500), shouldStop)
        } else {
            await controller.setMovementTarget('sternPort', 75, 'percent')
            await controller.setMovementTarget('sternStarboard', 100, 'percent')
            if (shouldStop()) return
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker)
                return
            await this.sleep(randomInt(1200, 2500), shouldStop)
        }

        //drop the bow
        if (Math.random() < 0.5) {
            await controller.setMovementTarget('sternPort', 0, 'percent')
            await controller.setMovementTarget('sternStarboard', 25, 'percent')
            if (shouldStop()) return
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker)
                return
            await this.sleep(randomInt(1200, 2500), shouldStop)
        } else {
            await controller.setMovementTarget('sternPort', 25, 'percent')
            await controller.setMovementTarget('sternStarboard', 0, 'percent')
            if (shouldStop()) return
            if (Date.now() - this.patternStartTime > this.inPatternTimeMarker)
                return
            await this.sleep(randomInt(1200, 2500), shouldStop)
        }
    }

    private chooseRandomSide() {
        const randomSide = Math.random() < 0.5 ? 'port' : 'starboard'
        return randomSide
    }

    private async sleep(ms: number, shouldStop: () => boolean): Promise<void> {
        const sleepInterval = 100 // Check every 100ms
        for (let elapsed = 0; elapsed < ms; elapsed += sleepInterval) {
            if (shouldStop()) return
            await new Promise((resolve) => setTimeout(resolve, sleepInterval))
        }
    }

    private async allPistonsToLowestPoint(controller: PneumaticsController) {
        const lowestPressure = 5 // Set all pistons to 5% pressure
        await controller.setMovementTarget('bowPort', lowestPressure, 'percent')
        await controller.setMovementTarget(
            'bowStarboard',
            lowestPressure,
            'percent'
        )
        await controller.setMovementTarget(
            'sternPort',
            lowestPressure,
            'percent'
        )
        await controller.setMovementTarget(
            'sternStarboard',
            lowestPressure,
            'percent'
        )
    }

    private async allPistonsToHighestPoint(controller: PneumaticsController) {
        const highestPressure = 95 // Set all pistons to 5% pressure
        await controller.setMovementTarget(
            'bowPort',
            highestPressure,
            'percent'
        )
        await controller.setMovementTarget(
            'bowStarboard',
            highestPressure,
            'percent'
        )
        await controller.setMovementTarget(
            'sternPort',
            highestPressure,
            'percent'
        )
        await controller.setMovementTarget(
            'sternStarboard',
            highestPressure,
            'percent'
        )
    }

    public async setPattern(patternName: PneumaticsCommandPatternName) {
        this.patternSwitchRequested = true
        const pattern = this.patterns.get(patternName)
        if (pattern) {
            await this.stopPattern() // Ensure the current pattern is fully stopped
            console.log('1')
            if (pattern.pressureSettings) {
                this.pneumaticsController.updatePressureSettings(
                    pattern.pressureSettings
                )
            } else {
                this.pneumaticsController.restoreDefaultPressureSettings()
            }
            console.log('2')
            this.currentPattern = pattern
            this.notifyPatternChange(patternName) // Notify about the new pattern
            console.log(`current pattern now: ${this.currentPattern.name}`)
            await this.startPattern()
            console.log('started pattern')
        } else {
            throw new Error(`Pattern '${patternName}' not found`)
        }
    }

    public async startPattern() {
        if (!this.currentPattern) {
            console.log('No pattern selected.')
            return
        }

        this.isRunning = true
        this.stopRequested = false
        this.patternSwitchRequested = false
        console.log('starting pattern', this.currentPattern.name)

        this.currentPatternExecution = this.executePattern()
    }

    private async executePattern() {
        try {
            await this.currentPattern!.main(
                this.pneumaticsController,
                () => this.stopRequested
            )
        } catch (error) {
            console.error('Error running pattern:', error)
        } finally {
            this.isRunning = false
            this.patternSwitchRequested = false
            await this.pneumaticsController.handleCommand({
                type: 'pneumaticsCommandText',
                command: 'holdPosition',
                sendTime: new Date().toLocaleString(),
            })
        }
    }

    public async stopPattern() {
        this.stopRequested = true
        if (this.currentPatternExecution) {
            console.log('waiting for pattern to stop')
            await this.currentPatternExecution
            console.log('pattern stopped')
            this.currentPatternExecution = null
        }
        this.notifyPatternChange(null) // Notify that no pattern is running
    }

    public isPatternRunning(): boolean {
        return this.isRunning
    }

    public getAvailablePatterns(): PneumaticsCommandPatternName[] {
        return Array.from(this.patterns.keys())
    }

    public getCurrentPattern(): PneumaticsCommandPatternName | null {
        return this.currentPattern ? this.currentPattern.name : null
    }
}
