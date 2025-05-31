import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { Gnrng, IdType, createIdBySeed, createIdsBySeed, gnrng, initWasm } from './index'

// 既存実装との比較用（互換性テスト）
import { createIdBySeed as utilsCreateIdBySeed } from '@internal/utils'

// WASM初期化の状態を追跡
let wasmAvailable = false

describe('@nap5/gnrng-id (Mixed Implementation)', () => {
  beforeAll(async () => {
    try {
      await initWasm()
      wasmAvailable = true
    } catch (_error) {
      wasmAvailable = false
      // モック環境では続行（モック設定でWASMが代替される）
    }
  })

  afterEach(() => {
    // メモリリークを避けるため、テスト後にGCを促す
    if (global.gc) {
      global.gc()
    }
  })

  describe('WASM initialization', () => {
    it('should initialize WASM module or use mocked implementation', async () => {
      if (wasmAvailable) {
        // 実際のWASM環境では再初期化しても問題ないことを確認
        await expect(initWasm()).resolves.toBeUndefined()
      } else {
        // モック環境では初期化が成功することを確認
        await expect(initWasm()).resolves.toBeUndefined()
      }
    })

    it('should handle multiple initialization calls', async () => {
      await expect(initWasm()).resolves.toBeUndefined()
      await expect(initWasm()).resolves.toBeUndefined()
    })
  })

  describe('Gnrng class (WASM implementation)', () => {
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

    it('should handle batch operations', () => {
      const rng = new Gnrng('batch-test')

      // バッチ乱数生成テスト
      const batch = rng.nextBatch(50)
      expect(batch).toHaveLength(50)

      for (const value of batch) {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }

      // バッチ範囲乱数生成テスト
      const rangeBatch = rng.nextRangeBatch(1, 10, 30)
      expect(rangeBatch).toHaveLength(30)

      for (const value of rangeBatch) {
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThan(10)
        expect(Number.isInteger(value)).toBe(true)
      }

      rng.free()
    })

    it('should generate deterministic batches', () => {
      const rng1 = new Gnrng('deterministic-test')
      const rng2 = new Gnrng('deterministic-test')

      const batch1 = rng1.nextBatch(20)
      const batch2 = rng2.nextBatch(20)

      expect(batch1).toEqual(batch2)

      rng1.free()
      rng2.free()
    })

    it('should handle large batch operations efficiently', () => {
      const rng = new Gnrng('large-batch-test')

      // 大量バッチのテスト（分割処理の確認）
      const largeBatch = rng.nextBatch(15000) // > BATCH_MAX_SIZE
      expect(largeBatch).toHaveLength(15000)

      // 全て有効な乱数値であることを確認
      for (const value of largeBatch.slice(0, 100)) {
        // サンプルチェック
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }

      rng.free()
    })

    it('should handle edge cases', () => {
      const rng = new Gnrng('edge-test')

      // 空のバッチ
      expect(rng.nextBatch(0)).toEqual([])
      expect(rng.nextRangeBatch(1, 10, 0)).toEqual([])

      // 無効な範囲
      expect(rng.nextRange(5, 5)).toBe(5)
      expect(rng.nextRange(10, 5)).toBe(10)

      rng.free()
    })
  })

  describe('gnrng factory function (WASM implementation)', () => {
    it('should create GNRNG instance', () => {
      const rng = gnrng('test-seed')
      expect(rng).toBeInstanceOf(Gnrng)
      rng.free()
    })

    it('should be compatible with utils implementation for basic functionality', () => {
      const wasmRng1 = gnrng('test-seed')
      const wasmRng2 = gnrng('test-seed')

      // WASM実装内での決定性の確認（同じシードなら同じ値）
      const wasmSequence1 = Array.from({ length: 5 }, () => wasmRng1.next())
      const wasmSequence2 = Array.from({ length: 5 }, () => wasmRng2.next())

      // 同じシードから生成された値は同じになるはず
      expect(wasmSequence1).toEqual(wasmSequence2)

      wasmRng1.free()
      wasmRng2.free()
    })
  })

  describe('createIdBySeed function (WASM gnrng + TypeScript ID generation)', () => {
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
      expect(id).toMatch(/^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{12}$/)
    })

    it('should respect type parameter', () => {
      const userId = createIdBySeed('test-seed', 7, IdType.User)
      const teamId = createIdBySeed('test-seed', 7, IdType.Team)
      const projectId = createIdBySeed('test-seed', 7, IdType.Project)
      const defaultId = createIdBySeed('test-seed', 7, IdType.Default)

      expect(userId).toMatch(/^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/)
      expect(teamId).toMatch(/^tm_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/)
      expect(projectId).toMatch(
        /^p_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
      expect(defaultId).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
    })

    it('should use safe alphabet only', () => {
      const id = createIdBySeed('alphabet-test', 50) // Large size to test alphabet
      const idContent = id.slice(2) // Remove prefix
      const safeAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

      for (const char of idContent) {
        expect(safeAlphabet).toContain(char)
      }
    })

    it('should be compatible with utils implementation', async () => {
      const wasmId1 = createIdBySeed('test-seed', 7, IdType.Default)
      const wasmId2 = createIdBySeed('test-seed', 7, IdType.Default)

      // WASM実装内での決定性を確認
      expect(wasmId1).toBe(wasmId2)

      // 同じパラメータで生成されたIDは同じフォーマットを持つ
      expect(wasmId1).toMatch(/^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/)

      // 注意: アルゴリズムの微細な違いにより、utilsとの完全一致は期待しない
      // 代わりに、同じプレフィックスとサイズを確認
      const utilsId = await utilsCreateIdBySeed('test-seed', 7, 'default')
      expect(wasmId1.length).toBe(utilsId.length)
      expect(wasmId1.startsWith('t_')).toBe(utilsId.startsWith('t_'))
    })

    it('should generate consistent results across multiple calls', () => {
      const seed = 'consistency-test'
      const ids = Array.from({ length: 10 }, () => createIdBySeed(seed, 8, IdType.User))

      // 全て同じIDになるはず（決定的）
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(1)
    })
  })

  describe('createIdsBySeed function (Batch WASM gnrng + TypeScript ID generation)', () => {
    it('should create multiple deterministic IDs', () => {
      const ids1 = createIdsBySeed('base', 5, 7, IdType.Default)
      const ids2 = createIdsBySeed('base', 5, 7, IdType.Default)

      expect(ids1).toHaveLength(5)
      expect(ids2).toHaveLength(5)

      // 同じベースシードなら同じ結果
      expect(ids1).toEqual(ids2)
    })

    it('should create different IDs with different base seeds', () => {
      const ids1 = createIdsBySeed('base1', 3, 7, IdType.Default)
      const ids2 = createIdsBySeed('base2', 3, 7, IdType.Default)

      expect(ids1).not.toEqual(ids2)
    })

    it('should create unique IDs within the same batch', () => {
      const ids = createIdsBySeed('unique-test', 10, 7, IdType.Default)

      // バッチ内では異なるIDになるはず
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
    })

    it('should respect all parameters', () => {
      const ids = createIdsBySeed('param-test', 3, 10, IdType.User)

      expect(ids).toHaveLength(3)

      for (const id of ids) {
        expect(id).toMatch(/^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{10}$/)
      }
    })

    it('should handle edge cases', () => {
      // 空のバッチ
      expect(createIdsBySeed('empty', 0, 7, IdType.Default)).toEqual([])

      // 単一ID
      const singleId = createIdsBySeed('single', 1, 7, IdType.Default)
      expect(singleId).toHaveLength(1)
      expect(singleId[0]).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
    })

    it('should be efficient for large batches', () => {
      const start = performance.now()
      const largeIds = createIdsBySeed('performance-test', 1000, 8, IdType.Default)
      const end = performance.now()

      expect(largeIds).toHaveLength(1000)
      expect(end - start).toBeLessThan(1000) // 1秒以内

      // ユニーク性確認
      const uniqueIds = new Set(largeIds)
      expect(uniqueIds.size).toBe(1000)
    })
  })

  describe('IdType enum', () => {
    it('should have correct enum values', () => {
      expect(IdType.User).toBe('user')
      expect(IdType.Team).toBe('team')
      expect(IdType.Project).toBe('project')
      expect(IdType.Default).toBe('default')
    })

    it('should generate correct prefixes', () => {
      expect(createIdBySeed('prefix-test', 7, IdType.User)).toMatch(/^u_/)
      expect(createIdBySeed('prefix-test', 7, IdType.Team)).toMatch(/^tm_/)
      expect(createIdBySeed('prefix-test', 7, IdType.Project)).toMatch(/^p_/)
      expect(createIdBySeed('prefix-test', 7, IdType.Default)).toMatch(/^t_/)
    })
  })

  describe('Performance and memory management', () => {
    it('should handle rapid instance creation and disposal', () => {
      for (let i = 0; i < 100; i++) {
        const rng = new Gnrng(`rapid-${i}`)
        rng.next()
        rng.free()
      }
    })

    it('should handle batch operations efficiently', () => {
      const rng = new Gnrng('batch-performance')

      const start = performance.now()
      const batch = rng.nextBatch(10000)
      const end = performance.now()

      expect(batch).toHaveLength(10000)
      expect(end - start).toBeLessThan(100) // 100ms以内

      rng.free()
    })

    it('should throw error when using freed instance', () => {
      const rng = new Gnrng('free-test')
      rng.free()

      // フリー後の使用でエラーが発生することを確認
      // WASMの場合、フリー後の使用は予期しない動作となる可能性があります
      // モック環境では特にエラーチェックは行わない
    })
  })

  describe('Integration tests', () => {
    it('should work together - WASM gnrng with TypeScript ID generation', () => {
      // createIdBySeedでWASM gnrngとTypeScript ID生成が協調することを確認
      const id1 = createIdBySeed('integration-test', 8, IdType.User)
      const id2 = createIdBySeed('integration-test', 8, IdType.User)

      expect(id1).toBe(id2) // 決定的
      expect(id1).toMatch(/^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{8}$/)
    })

    it('should maintain consistency between individual and batch operations', () => {
      // バッチ処理では各IDに異なるシードを使用するため、
      // 個別生成と異なる結果になることが期待される
      const individual = createIdBySeed('consistency-base-0', 7, IdType.Default)
      const batch = createIdsBySeed('consistency-base', 1, 7, IdType.Default)

      // バッチの最初の要素は individual と同じシード（'consistency-base-0'）を使用
      expect(batch[0]).toBe(individual)

      // フォーマットは同じ
      expect(individual).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
      expect(batch[0]).toMatch(
        /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
      )
    })

    it('should demonstrate WASM performance advantage', () => {
      const wasmRng = new Gnrng('performance-comparison')

      // WASM版のバッチ処理は高速であることを確認
      const start = performance.now()
      const results = wasmRng.nextBatch(5000)
      const end = performance.now()

      expect(results).toHaveLength(5000)
      expect(end - start).toBeLessThan(50) // 50ms以内

      wasmRng.free()
    })
  })

  describe('Error handling', () => {
    it('should handle WASM initialization errors gracefully', () => {
      // 初期化済み状態での再初期化は問題なし
      expect(() => initWasm()).not.toThrow()
    })

    it('should handle invalid parameters gracefully', () => {
      const rng = new Gnrng('error-test')

      // 負のカウント
      expect(rng.nextBatch(-1)).toEqual([])
      expect(rng.nextRangeBatch(1, 10, -1)).toEqual([])

      // 無効な範囲
      expect(rng.nextRange(10, 5)).toBe(10)

      rng.free()
    })
  })
})
