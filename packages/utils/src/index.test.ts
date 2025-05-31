import { describe, expect, it } from 'vitest'
import { type Brand, createId, createIdBySeed, getName, gnrng } from './index'

describe('Index exports', () => {
  it('should export getName function', () => {
    expect(typeof getName).toBe('function')
    expect(getName('test', [])).toBe('test')
  })

  it('should export gnrng function', () => {
    expect(typeof gnrng).toBe('function')
    const rng = gnrng('test')
    expect(typeof rng).toBe('function')
  })

  it('should export createId function', () => {
    expect(typeof createId).toBe('function')
    const id = createId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('should export createIdBySeed function', () => {
    expect(typeof createIdBySeed).toBe('function')
    const id = createIdBySeed('test')
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('should export Brand type (compile-time check)', () => {
    // @ts-expect-error This is a compile-time test - if it compiles, the type is exported correctly
    type TestBrand = Brand<string, unique symbol>
    const testValue: TestBrand = 'test' as TestBrand
    expect(typeof testValue).toBe('string')
  })
})

describe('Integration tests', () => {
  it('should work together - createIdBySeed and getName', () => {
    // Create deterministic IDs
    const id1 = createIdBySeed('base', 5, 'user')
    const id2 = createIdBySeed('base', 5, 'user') // Same as id1
    const id3 = createIdBySeed('other', 5, 'user') // Different

    expect(id1).toBe(id2)
    expect(id1).not.toBe(id3)

    // Use getName to avoid conflicts
    const existingIds = [id1, id3]
    const newName = getName(id1, existingIds)

    expect(newName).toBe(`${id1} (1)`)
    expect(existingIds.includes(newName)).toBe(false)
  })

  it('should work together - gnrng and createIdBySeed consistency', () => {
    // Both should use the same seed-based generation
    const seed = 'consistency-test'

    const id1 = createIdBySeed(seed, 7)
    const id2 = createIdBySeed(seed, 7)

    expect(id1).toBe(id2)

    // The underlying RNG should also be consistent
    const rng1 = gnrng(seed)
    const rng2 = gnrng(seed)

    expect(rng1()).toBe(rng2())
  })
})
