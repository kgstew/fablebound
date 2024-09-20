import { appConfig } from 'app'
import * as blessed from 'blessed'
import * as fs from 'fs'
import WebSocket from 'ws'

const screen = blessed.screen({
    smartCSR: true,
    title: 'Socket Manager',
})

const connections: Record<string, WebSocket | null> = {}

const items = Object.keys(appConfig.sockets).reduce((acc, key) => {
    acc.push(key)
    acc.push(`  ${connections[key] ? 'Disconnect' : 'Connect'}`)
    acc.push('  Send message')
    acc.push('  Send message from file')
    return acc
}, [] as string[])

const list = blessed.list({
    items,
    border: 'line',
    style: {
        selected: {
            bg: 'blue',
        },
    },
    keys: true,
    vi: true,
    mouse: true,
})

const log = blessed.log({
    top: '50%',
    height: '50%',
    border: 'line',
    label: 'Log',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        ch: ' ',
    },
})

const prompt = blessed.prompt({
    border: 'line',
    height: 'shrink',
    width: 'half',
    top: 'center',
    left: 'center',
    label: 'Send Message',
    tags: true,
    keys: true,
    vi: true,
})

const fileManager = blessed.filemanager({
    border: 'line',
    height: 'shrink',
    width: 'half',
    top: 'center',
    left: 'center',
    label: 'Select File',
    tags: true,
    keys: true,
    vi: true,
    hidden: true,
    style: {
        selected: {
            bg: 'green', // Change the selected file color to green
        },
    },
})

screen.append(list)
screen.append(log)
screen.append(prompt)
screen.append(fileManager)

list.focus()

list.on('select', (item, index) => {
    const key = item.getText().trim()
    if (key === 'Connect' || key === 'Disconnect') {
        const parentIndex = index - 1
        const parentKey = list
            .getItem(parentIndex)
            .getText() as keyof typeof appConfig.sockets
        if (connections[parentKey]) {
            log.log(`Disconnecting from ${parentKey}...`)
            connections[parentKey]?.close()
            connections[parentKey] = null
            list.setItem(item, '  Connect')
            log.log(`Disconnected from ${parentKey}`)
        } else {
            log.log(
                `Connecting to ${parentKey} on port ${appConfig.sockets[parentKey]}...`
            )
            const ws = new WebSocket(
                `ws://localhost:${appConfig.sockets[parentKey]}`
            )
            ws.on('open', () => {
                log.log(`Connected to ${parentKey}`)
                connections[parentKey] = ws
                list.setItem(item, '  Disconnect')
                screen.render()
            })
            ws.on('close', () => {
                log.log(`Connection to ${parentKey} closed`)
                connections[parentKey] = null
                list.setItem(item, '  Connect')
                screen.render()
            })
            ws.on('error', (error) => {
                log.log(`Error connecting to ${parentKey}: ${error.message}`)
                connections[parentKey] = null
                list.setItem(item, '  Connect')
                screen.render()
            })
            ws.on('message', (message) => {
             //   log.log(`Received message from ${parentKey}: ${message}`)
                screen.render()
            })
        }
    } else if (key === 'Send message') {
        const parentIndex = index - 2
        const parentKey = list.getItem(parentIndex).getText()
        if (connections[parentKey]) {
            prompt.input('Enter your message:', '', (err, value) => {
                if (err) {
                    log.log(`Error: ${err.message}`)
                } else if (value) {
                    connections[parentKey]?.send(value)
                    log.log(`Sent message to ${parentKey}: ${value}`)
                }
                screen.render()
            })
        } else {
            log.log(`No connection to ${parentKey}. Please connect first.`)
        }
    } else if (key === 'Send message from file') {
        const parentIndex = index - 3
        const parentKey = list.getItem(parentIndex).getText()
        if (connections[parentKey]) {
            fileManager.cwd = process.cwd()
            fileManager.show()
            fileManager.refresh()
            fileManager.focus()
            fileManager.once('file', (file) => {
                const filePath = `${file}`
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        log.log(`Error reading file: ${err.message}`)
                    } else {
                        connections[parentKey]?.send(data)
                        log.log(
                            `Sent message from file to ${parentKey}: ${data}`
                        )
                    }
                    fileManager.hide()
                    list.focus()
                    screen.render()
                })
            })
        } else {
            log.log(`No connection to ${parentKey}. Please connect first.`)
        }
    }
    screen.render()
})

screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

screen.render()
