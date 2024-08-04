import { PneumaticsSystemService } from 'domain/'
import { Handler } from '../handler'
import { PneumaticsModelSingleton, PneumaticsPatternController } from 'domain/controllers/pneumatics-controller'
import { PneumaticsCommandPatternMessage, isValidPneumaticsPattern } from 'domain/controllers/types'

class PneumaticsCommandPatternHandler implements Handler<PneumaticsCommandPatternMessage> {
    private pneumaticsPatternController: PneumaticsPatternController;

    constructor(private pneumaticSystemService: PneumaticsSystemService) {
        const pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance();
        this.pneumaticsPatternController = new PneumaticsPatternController(pneumaticsModelSingleton.model);
    }

    validate(data: unknown): PneumaticsCommandPatternMessage {
        if (!data) {
            throw new Error('Data is required');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object');
        }

        const cmd = data as Partial<PneumaticsCommandPatternMessage>;
        
        if (cmd.type !== 'pneumaticsCommandPattern' || typeof cmd.sendTime !== 'string') {
            throw new Error('Missing or invalid required fields: type or sendTime');
        }
        if (!isValidPneumaticsPattern(cmd.pattern!)) {
            throw new Error('Invalid pattern!');
        }

        return cmd as PneumaticsCommandPatternMessage;
    }

    async handle(data: unknown): Promise<void> {
        console.log("Received data:", data);

        const validatedCommand = this.validate(data);

        // Set the pattern
        this.pneumaticsPatternController.setPattern(validatedCommand.pattern);

        // Start the pattern
        try {
            await this.pneumaticsPatternController.startPattern();
        } catch (error) {
            console.error("Error running pattern:", error);
        }
    }
}

export { PneumaticsCommandPatternHandler }