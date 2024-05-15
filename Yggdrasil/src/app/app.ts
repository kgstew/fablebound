import { createWebApp } from "../api/web/express-app"
import { pneumaticsSystemService } from "./config"

const run = async () => {

    const app = createWebApp(pneumaticsSystemService)
    
    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

export { run }
