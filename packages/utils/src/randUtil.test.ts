import { describe, expect, it } from 'vitest'
import { createId, createIdBySeed, gnrng } from './randUtil'

describe('gnrng', () => {
  it('should return a function', () => {
    const rng = gnrng('test-seed')
    expect(typeof rng).toBe('function')
  })

  it('should generate the same sequence for the same seed', () => {
    const rng1 = gnrng('test-seed')
    const rng2 = gnrng('test-seed')

    const sequence1 = [rng1(), rng1(), rng1()]
    const sequence2 = [rng2(), rng2(), rng2()]

    expect(sequence1).toEqual(sequence2)
  })

  it('should generate different sequences for different seeds', () => {
    const rng1 = gnrng('seed1')
    const rng2 = gnrng('seed2')

    const sequence1 = [rng1(), rng1(), rng1()]
    const sequence2 = [rng2(), rng2(), rng2()]

    expect(sequence1).not.toEqual(sequence2)
  })

  it('should generate numbers between -1 and 1', () => {
    const rng = gnrng('test-seed')

    for (let i = 0; i < 100; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(-1)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('createId', () => {
  it('should create an ID with default parameters', () => {
    const id = createId()
    expect(id).toMatch(
      /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )
  })

  it('should create an ID with specified size', () => {
    const id = createId(10)
    expect(id).toMatch(
      /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{10}$/
    )
  })

  it('should create an ID with specified type', () => {
    const userId = createId(7, 'user')
    const teamId = createId(7, 'team')
    const projectId = createId(7, 'project')

    expect(userId).toMatch(
      /^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )
    expect(teamId).toMatch(
      /^tm_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )
    expect(projectId).toMatch(
      /^p_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )
  })

  it('should generate unique IDs', () => {
    const ids = new Set()
    for (let i = 0; i < 1000; i++) {
      ids.add(createId())
    }
    expect(ids.size).toBe(1000)
  })

  it('should use safe alphabet (no ambiguous characters)', () => {
    const id = createId(100) // Large size to increase chance of all characters
    expect(id).not.toMatch(
      't_zL2jnDDx2THCTmjUHYgRoB2nXpaeYujyNz6YcnduHQ9XReSVEa9HPxsYZgaZabsjYGuHDat2JqctS7fbdC7V1ktC7o9LZvjGbe5e'
    )
  })
})

describe('createIdBySeed', () => {
  it('should create deterministic IDs with the same seed', () => {
    const id1 = createIdBySeed('test-seed')
    const id2 = createIdBySeed('test-seed')

    expect(id1).toBe(id2)
  })

  it('should create different IDs with different seeds', () => {
    const id1 = createIdBySeed('seed1')
    const id2 = createIdBySeed('seed2')

    expect(id1).not.toBe(id2)
  })

  it('should respect size parameter', () => {
    const id = createIdBySeed('test-seed', 10)
    expect(id).toMatch(
      /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{10}$/
    )
  })

  it('should respect type parameter', () => {
    const userId = createIdBySeed('test-seed', 7, 'user')
    const teamId = createIdBySeed('test-seed', 7, 'team')

    expect(userId).toMatch(
      /^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )
    expect(teamId).toMatch(
      /^tm_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )
  })

  it('should create the same ID for the same parameters', () => {
    const id1 = createIdBySeed('same-seed', 8, 'project')
    const id2 = createIdBySeed('same-seed', 8, 'project')

    expect(id1).toBe(id2)
  })

  it('should be consistent across multiple calls', () => {
    const seed = 'consistency-test'
    const ids = []

    for (let i = 0; i < 10; i++) {
      ids.push(createIdBySeed(seed))
    }

    // All IDs should be the same
    expect(new Set(ids).size).toBe(1)
  })

  it('should produce different results for slightly different seeds', () => {
    const id1 = createIdBySeed('seed')
    const id2 = createIdBySeed('seed1')
    const id3 = createIdBySeed('seed2')

    expect(id1).not.toBe(id2)
    expect(id1).not.toBe(id3)
    expect(id2).not.toBe(id3)
  })
})
