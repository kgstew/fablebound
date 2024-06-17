import { PneumaticsSystemService } from 'domain/'
import { Handler } from '../handler'
import { PneumaticsCommand } from './pneumatics-command'

class PneumaticsCommandHandler implements Handler<PneumaticsCommand> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}
    validate(data: unknown): PneumaticsCommand {
        if (!data) {
            throw new Error('Data is required')
        }
        throw new Error('Method not implemented.')
    }
    async handle(data: unknown): Promise<void> {
        console.log("WOOOO",data)
        const commands = this.validate(data)
        console.log("WOOOO",commands)


        throw new Error('Method not implemented.')
    }}

export { PneumaticsCommandHandler }
