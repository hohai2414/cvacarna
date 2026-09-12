import { describe, it, expect } from 'vitest'
import { calculateLifePathNumber } from './numerology'

describe('calculateLifePathNumber', () => {
  it('calculates standard numbers correctly', () => {
    // 1990-12-15 -> 1+9+9+0 + 1+2 + 1+5 = 28 -> 2+8 = 10 -> 1+0 = 1
    expect(calculateLifePathNumber('1990-12-15')).toBe(1)
  })

  it('keeps master numbers (11, 22, 33)', () => {
    // 1990-01-01 -> 1+9+9+0 + 0+1 + 0+1 = 21 -> 2+1 = 3
    expect(calculateLifePathNumber('1990-01-01')).toBe(3)
    
    // 1982-10-08 -> 1+9+8+2 + 1+0 + 0+8 = 29 -> 2+9 = 11
    expect(calculateLifePathNumber('1982-10-08')).toBe(11)
  })

  it('handles invalid input gracefully', () => {
    expect(calculateLifePathNumber('')).toBe(0)
    expect(calculateLifePathNumber('invalid-date')).toBe(0)
  })
})
