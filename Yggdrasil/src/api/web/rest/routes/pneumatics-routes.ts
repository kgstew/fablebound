import { Router } from 'express'
import { PneumaticsSystemService } from '../../../../domain'
import { PneumaticsController } from '../../controllers'

const createPneumaticsRouter = (
    pneumaticSystemService: PneumaticsSystemService
): Router => {
    const router = Router()
    const pneumaticsController = new PneumaticsController(
        pneumaticSystemService
    )

    router.post('/move-side', (req, res) =>
        pneumaticsController.moveSide(req, res)
    )
    router.post('/update-pressure-readings', (req, res) =>
        pneumaticsController.updatePressureReadings(req, res)
    )
    return router
}

export { createPneumaticsRouter }
