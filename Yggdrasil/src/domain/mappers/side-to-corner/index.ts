import { Corner, Side } from '../../models'

const sideToCorners = (side: Side): Corner[] => {
    const mapping: Record<Side, Corner[]> = {
        front: ['frontLeft', 'frontRight'],
        rear: ['rearLeft', 'rearRight'],
        left: ['frontLeft', 'rearLeft'],
        right: ['frontRight', 'rearRight'],
        frontLeft: ['frontLeft'],
        frontRight: ['frontRight'],
        rearLeft: ['rearLeft'],
        rearRight: ['rearRight'],
    }

    if (side in mapping) {
        return mapping[side]
    } else {
        throw new Error('Invalid input')
    }
}

export { sideToCorners }
