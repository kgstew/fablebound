import { Console } from 'console'
import { createWriteStream } from 'fs'

const tableLogStream = createWriteStream('table.log', { flags: 'a' })
const fullLogStream = createWriteStream('full.log', { flags: 'a' })

const tableConsole = new Console({
    stdout: tableLogStream,
    stderr: tableLogStream,
})

const fullConsole = new Console({
    stdout: fullLogStream,
    stderr: fullLogStream,
})

export { fullConsole, tableConsole }
