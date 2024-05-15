import express from 'express'
import { createPneumaticsRouter } from './routes/pneumatics-routes'
import { PneumaticsSystemService } from '../../domain'

const createWebApp = (pneumaticsSystemService: PneumaticsSystemService) => {
    const app = express()

    app.use(express.json())
    app.use('/pneumatics', createPneumaticsRouter(pneumaticsSystemService))

    return app
}

export { createWebApp }
