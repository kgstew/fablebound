import { Corner, Side } from "../../models"

const sideToCorners = (side: Side): Corner[] => {
    switch (side) {
        case 'front':
            return ['frontLeft', 'frontRight']
        case 'rear':
            return ['rearLeft', 'rearRight']
        case 'left':
            return ['frontLeft', 'rearLeft']
        case 'right':
            return ['frontRight', 'rearRight']
        case 'frontLeft':
            return ['frontLeft']
        case 'frontRight':
            return ['frontRight']
        case 'rearLeft':
            return ['rearLeft']
        case 'rearRight':
            return ['rearRight']
        default: 
            throw new Error('Invalid input')
    }
}

export { sideToCorners }