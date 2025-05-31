import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  Gnrng,
  IdType,
  auto,
  createId,
  createIdBySeed,
  getName,
  gnrng,
  initWasm,
  name,
  version,
} from './index'

// 既存実装との比較用（互換性テスト）
import {
  createIdBySeed as utilsCreateIdBySeed,
  getName as utilsGetName,
  gnrng as utilsGnrng,
} from '@internal/utils'

describe('@nap5/gnrng-id', () => {
  beforeAll(async () => {
    await initWasm()
  })

  afterEach(() => {
    // メモリリークを避けるため、テスト後にGCを促す
    if (global.gc) {
      global.gc()
    }
  })

  describe('Library metadata', () => {
    it('should export correct version and name', () => {
      expect(version).toBe('0.1.0')
      expect(name).toBe('@nap5/gnrng-id')
    })
  })

  describe('WASM initialization', () => {
    it('should initialize WASM module', async () => {
      // 既に beforeAll で初期化済みなので、再初期化しても問題ないことを確認
      await expect(initWasm()).resolves.toBeUndefined()
    })

    it('should handle multiple initialization calls', async () => {
      await expect(initWasm()).resolves.toBeUndefined()
      await expect(initWasm()).resolves.toBeUndefined()
    })
  })

  describe('Gnrng class', () => {
    it('should create GNRNG instance with seed', () => {
      const rng = new Gnrng('test-seed')
      expect(rng).toBeInstanceOf(Gnrng)
      rng.free()
    })

    it('should generate deterministic values with same seed', () => {
      const rng1 = new Gnrng('test-seed')
      const rng2 = new Gnrng('test-seed')

      const sequence1 = Array.from({ length: 10 }, () => rng1.next())
      const sequence2 = Array.from({ length: 10 }, () => rng2.next())

      expect(sequence1).toEqual(sequence2)

      rng1.free()
      rng2.free()
    })

    it('should generate different values with different seeds', () => {
      const rng1 = new Gnrng('seed1')
      const rng2 = new Gnrng('seed2')

      const value1 = rng1.next()
      const value2 = rng2.next()

      expect(value1).not.toBe(value2)

      rng1.free()
      rng2.free()
    })

    it('should generate values in range [0, 1)', () => {
      const rng = new Gnrng('test-seed')

      for (let i = 0; i < 100; i++) {
        const value = rng.next()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }

      rng.free()
    })

    it('should generate integers in specified range', () => {
      const rng = new Gnrng('test-seed')
      const min = 10
      const max = 20

      for (let i = 0; i < 100; i++) {
        const value = rng.nextRange(min, max)
        expect(value).toBeGreaterThanOrEqual(min)
        expect(value).toBeLessThan(max)
        expect(Number.isInteger(value)).toBe(true)
      }

      rng.free()
    })
  })

  describe('gnrng factory function', () => {
    it('should create GNRNG instance', () => {
      const rng = gnrng('test-seed')
      expect(rng).toBeInstanceOf(Gnrng)
      rng.free()
    })

    it('should be compatible with utils implementation', () => {
      const wasmRng = gnrng('test-seed')
      const utilsRng = utilsGnrng('test-seed')

      // 決定性の確認（同じシードなら同じ値）
      const wasmSequence = Array.from({ length: 5 }, () => wasmRng.next())
      const utilsSequence = Array.from({ length: 5 }, () => utilsRng())

      expect(wasmSequence).toEqual(utilsSequence)

      wasmRng.free()
    })
  })

  describe('createId function', () => {
    it('should create ID with default parameters', () => {
      const id = createId()
      expect(id).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
    })

    it('should create ID with custom size', () => {
      const id = createId(10)
      expect(id).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{10}$/
      )
    })

    it('should create ID with different types', () => {
      const userId = createId(7, IdType.User)
      const teamId = createId(7, IdType.Team)
      const projectId = createId(7, IdType.Project)
      const defaultId = createId(7, IdType.Default)

      expect(userId).toMatch(/^u_/)
      expect(teamId).toMatch(/^tm_/)
      expect(projectId).toMatch(/^p_/)
      expect(defaultId).toMatch(/^t_/)
    })

    it('should generate unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 1000; i++) {
        ids.add(createId())
      }
      expect(ids.size).toBe(1000)
    })

    it('should use safe alphabet only', () => {
      const id = createId(100) // Large size to test alphabet
      const idContent = id.slice(2) // Remove prefix
      const safeAlphabet =
        '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

      for (const char of idContent) {
        expect(safeAlphabet).toContain(char)
      }
    })
  })

  describe('createIdBySeed function', () => {
    it('should create deterministic IDs with same seed', () => {
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
      const id = createIdBySeed('test-seed', 12)
      expect(id).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{12}$/
      )
    })

    it('should respect type parameter', () => {
      const userId = createIdBySeed('test-seed', 7, IdType.User)
      expect(userId).toMatch(
        /^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
    })

    it('should be compatible with utils implementation', () => {
      const wasmId = createIdBySeed('test-seed', 7, IdType.Default)
      const utilsId = utilsCreateIdBySeed('test-seed', 7, 'default')

      // 同じアルゴリズムなので同じ結果になるはず
      expect(wasmId).toBe(utilsId)
    })
  })

  describe('getName function', () => {
    it('should return original name when no conflicts', () => {
      const result = getName('Panel', [])
      expect(result).toBe('Panel')
    })

    it('should return original name when no conflicts exist', () => {
      const result = getName('Panel', ['Other', 'Different'])
      expect(result).toBe('Panel')
    })

    it('should add (1) when original name exists', () => {
      const result = getName('Panel', ['Panel'])
      expect(result).toBe('Panel (1)')
    })

    it('should increment number when multiple conflicts exist', () => {
      const result = getName('Panel', ['Panel', 'Panel (1)'])
      expect(result).toBe('Panel (2)')
    })

    it('should find next available number in sequence', () => {
      const result = getName('Panel', [
        'Panel',
        'Panel (1)',
        'Panel (2)',
        'Panel (3)',
      ])
      expect(result).toBe('Panel (4)')
    })

    it('should handle gaps in numbering sequence', () => {
      const result = getName('Panel', ['Panel', 'Panel (3)', 'Panel (5)'])
      expect(result).toBe('Panel (1)')
    })

    it('should handle names that already have numbers', () => {
      const result = getName('Panel (2)', ['Panel (2)'])
      expect(result).toBe('Panel (3)')
    })

    it('should be compatible with utils implementation', () => {
      const testCases = [
        ['Panel', []],
        ['Panel', ['Panel']],
        ['Panel', ['Panel', 'Panel (1)']],
        ['Panel', ['Panel', 'Panel (3)', 'Panel (5)']],
        ['Panel (2)', ['Panel (2)']],
      ] as const

      for (const [name, existing] of testCases) {
        const wasmResult = getName(name, existing)
        const utilsResult = utilsGetName(name, existing)
        expect(wasmResult).toBe(utilsResult)
      }
    })
  })

  describe('Async API (auto namespace)', () => {
    it('should auto-initialize and create ID', async () => {
      const id = await auto.createId()
      expect(id).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
    })

    it('should auto-initialize and create ID by seed', async () => {
      const id1 = await auto.createIdBySeed('test-seed')
      const id2 = await auto.createIdBySeed('test-seed')
      expect(id1).toBe(id2)
    })

    it('should auto-initialize and create GNRNG', async () => {
      const rng = await auto.gnrng('test-seed')
      expect(rng).toBeInstanceOf(Gnrng)
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
      rng.free()
    })

    it('should auto-initialize and get unique name', async () => {
      const result = await auto.getName('Panel', ['Panel'])
      expect(result).toBe('Panel (1)')
    })
  })

  describe('Error handling', () => {
    it('should handle invalid range in nextRange', () => {
      const rng = new Gnrng('test-seed')

      // min >= max の場合は min を返すはず
      const result = rng.nextRange(10, 10)
      expect(result).toBe(10)

      const result2 = rng.nextRange(10, 5)
      expect(result2).toBe(10)

      rng.free()
    })
  })

  describe('Performance considerations', () => {
    it('should handle large ID generation efficiently', () => {
      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        createId(7, IdType.Default)
      }

      const end = performance.now()
      const duration = end - start

      // 1000個のID生成が1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000)
    })

    it('should handle large GNRNG sequence generation efficiently', () => {
      const rng = new Gnrng('test-seed')
      const start = performance.now()

      for (let i = 0; i < 10000; i++) {
        rng.next()
      }

      const end = performance.now()
      const duration = end - start

      // 10000回の乱数生成が1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000)

      rng.free()
    })
  })

  describe('Integration tests', () => {
    it('should work together - createIdBySeed and getName', () => {
      const id1 = createIdBySeed('base', 5, IdType.User)
      const id2 = createIdBySeed('base', 5, IdType.User) // Same as id1
      const id3 = createIdBySeed('other', 5, IdType.User) // Different

      expect(id1).toBe(id2)
      expect(id1).not.toBe(id3)

      // Use getName to avoid conflicts
      const existingIds = [id1, id3]
      const newName = getName(id1, existingIds)

      expect(newName).toBe(`${id1} (1)`)
      expect(existingIds.includes(newName)).toBe(false)
    })

    it('should work together - gnrng and createIdBySeed consistency', () => {
      const seed = 'consistency-test'

      const id1 = createIdBySeed(seed, 7)
      const id2 = createIdBySeed(seed, 7)

      expect(id1).toBe(id2)

      // The underlying RNG should also be consistent
      const rng1 = gnrng(seed)
      const rng2 = gnrng(seed)

      expect(rng1.next()).toBe(rng2.next())

      rng1.free()
      rng2.free()
    })
  })
})
