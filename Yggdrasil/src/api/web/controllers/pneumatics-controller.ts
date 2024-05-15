import { Request, Response } from 'express'
import { PneumaticsSystemService, PressureReading } from '../../../domain'

class PneumaticsController {
    constructor(private pneumaticsSystemService: PneumaticsSystemService) {}

    async moveSide(req: Request, res: Response): Promise<void> {
        try {
            const { side, targetPressurePsi } = req.body
            console.log(`Moving ${side} side to level ${targetPressurePsi}`)
            await this.pneumaticsSystemService.moveSide(side, targetPressurePsi)
            console.log(`Moved ${side} side to level ${targetPressurePsi}`)
            res.status(200).send()
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message })
            } else {
                res.status(500).json({ error: 'An unknown error occurred' })
            }
        }
    }

    updatePressureReadings(req: Request, res: Response): void {
        try {
            const pressureReadings: PressureReading[] = req.body
            console.log('Updating pressure readings')
            this.pneumaticsSystemService.updatePressureReadings(
                pressureReadings
            )
            console.log('Updated pressure readings')
            res.status(200).send()
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message })
            } else {
                res.status(500).json({ error: 'An unknown error occurred' })
            }
        }
    }
}

export { PneumaticsController }
