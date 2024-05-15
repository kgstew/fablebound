import { Router } from 'express';
import { PneumaticsController } from '../controllers';
import { PneumaticsSystemService } from '../../../domain';

const createPneumaticsRouter = (pneumaticSystemService: PneumaticsSystemService): Router => {
const router = Router();
const pneumaticsController = new PneumaticsController(pneumaticSystemService);

router.post('/move-side', (req, res) => pneumaticsController.moveSide(req, res));
router.post('/update-pressure-readings', (req, res) => pneumaticsController.updatePressureReadings(req, res));
return router
}

export { createPneumaticsRouter }