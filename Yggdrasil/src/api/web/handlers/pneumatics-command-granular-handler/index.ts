import { PneumaticsSystemService } from 'domain/'
import { Handler } from '../handler'
import { PneumaticsCommandGranular } from './pneumatics-command-granular'

class PneumaticsCommandGranularHandler implements Handler<PneumaticsCommandGranular> {
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}
    validate(data: unknown): PneumaticsCommandGranular {
        if (!data) {
            throw new Error('Data is required')
        }
        const pneumaticsCommandsGranular = data as PneumaticsCommandGranular
        return pneumaticsCommandsGranular
    }
    async handle(data: unknown): Promise<void> {
        console.log("WOOOO",data)
        const commands = this.validate(data)
        console.log("WOOOO",commands)


        throw new Error('Method not implemented.')
    }}

export { PneumaticsCommandGranularHandler as PneumaticsCommandHandler }
