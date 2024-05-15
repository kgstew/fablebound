import { sideToCorners } from '.'
import { Side } from '../../models'

test('sideToCorners returns correct corners for left side', () => {
    expect(sideToCorners('left')).toEqual(['frontLeft', 'rearLeft'])
})

test('sideToCorners returns correct corners for right side', () => {
    expect(sideToCorners('right')).toEqual(['frontRight', 'rearRight'])
})

test('sideToCorners returns correct corners for frontLeft side', () => {
    expect(sideToCorners('frontLeft')).toEqual(['frontLeft'])
})

test('sideToCorners returns correct corners for rearLeft side', () => {
    expect(sideToCorners('rearLeft')).toEqual(['rearLeft'])
})

test('sideToCorners returns correct corners for frontRight side', () => {
    expect(sideToCorners('frontRight')).toEqual(['frontRight'])
})

test('sideToCorners returns correct corners for rearRight side', () => {
    expect(sideToCorners('rearRight')).toEqual(['rearRight'])
})

test('sideToCorners throws error for invalid input', () => {
    expect(() => sideToCorners('invalid' as unknown as Side)).toThrow(
        'Invalid input'
    )
})
