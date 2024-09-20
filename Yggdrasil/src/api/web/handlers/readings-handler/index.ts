import { PneumaticsSystemService, PressureReading, Valve } from 'domain/'
import { Handler } from '../handler'
import { Readings } from './readings'
import { webSocketConnections } from 'app/websocket/server/open-socket';
import { BowOrSternReadingsData, ReadingsData } from 'domain/controllers/types';
import { PneumaticsModelSingleton } from 'domain/controllers/pneumatics-controller';
import { validateHeaderValue } from 'http';


type BigAssMainTankReadings = {
    pressurePsi: number;
    compressorToTankValve: Valve;
}

type LegAssemblyReadings = {
    ballastPressurePsi: number;
    pistonPressurePsi: number;
    ballastIntakeValve: Valve;
    ballastToPistonValve: Valve;
    pistonReleaseValve: Valve;
}




abstract class ReadingsHandlerBase implements Handler<BowOrSternReadingsData> {
    abstract readonly position: 'BOW' | 'STERN';
    constructor(private pneumaticSystemService: PneumaticsSystemService) {}

    validate(data: unknown): BowOrSternReadingsData {
        if (!data) {
            throw new Error('Data is required');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type, expected an object');
        }

        const cmd = data as Partial<BowOrSternReadingsData>; // Use Partial to handle optional properties
       // console.log(cmd)
        if ((cmd.type !== 'espToServerSystemStateBow' && cmd.type !== 'espToServerSystemStateStern') || typeof cmd.sendTime !== 'string') {
            throw new Error('Missing or invalid required fields: type or sendTime');
        }
        this.validateLegAssemblyReadings(cmd.starboard, 'starboard');
        this.validateLegAssemblyReadings(cmd.port, 'port');

        return cmd as BowOrSternReadingsData;
    }
    private validateBigAssMainTankReadings(tank: BigAssMainTankReadings | undefined): asserts tank is BigAssMainTankReadings {
        if (!tank || typeof tank.pressurePsi !== 'number' || !this.validateValve(tank.compressorToTankValve)) {
            throw new Error('Invalid BigAssMainTank readings');
        }
    }

    private validateLegAssemblyReadings(assembly: LegAssemblyReadings | undefined, name: string): asserts assembly is LegAssemblyReadings {
        if (!assembly || typeof assembly.ballastPressurePsi !== 'number' ||
            typeof assembly.pistonPressurePsi !== 'number' ||
            !this.validateValve(assembly.ballastIntakeValve) ||
            !this.validateValve(assembly.ballastToPistonValve) ||
            !this.validateValve(assembly.pistonReleaseValve)) {
            throw new Error(`Invalid ${name} readings`);
        }
    }

    private validateValve(valve: Valve | undefined): boolean {
        return valve !== undefined && (valve === 'open' || valve === 'closed');
    }

    async handle(data: unknown): Promise<void> {
       // console.log("Received data:", data);

        const validatedData = this.validate(data);
        const stringifiedValidatedData = JSON.stringify(validatedData)
        
        const pneumaticsModelSingleton = PneumaticsModelSingleton.getInstance();
        pneumaticsModelSingleton.model.updateSystemStateFromReadings(validatedData);
 
        if ('frontend' in webSocketConnections) {
            webSocketConnections['frontend'].send(stringifiedValidatedData);
            //console.log("Data sent to frontend.");
        } else {
          //  console.log("Failed to send data: 'frontend' connection does not exist.");
        }

       // console.log("Processed Readings:", validatedData);
    }
}

class ReadingsHandlerBow extends ReadingsHandlerBase {
    readonly position: 'BOW' = 'BOW';
}

class ReadingsHandlerStern extends ReadingsHandlerBase {
    readonly position: 'STERN' = 'STERN';
}
export { ReadingsHandlerBow, ReadingsHandlerStern }
