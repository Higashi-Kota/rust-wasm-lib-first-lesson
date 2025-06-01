import { Gnrng, IdType, createIdBySeed, initWasm } from '@nap5/gnrng-id'
import { beforeAll, describe, expect, it } from 'vitest'

describe('@nap5/gnrng-id library integration test', () => {
  beforeAll(async () => {
    // WASMモジュールを初期化（モック環境では自動的にモックが使用される）
    await initWasm()
  })

  it('should initialize WASM module successfully', async () => {
    // 初期化が成功することを確認
    await expect(initWasm()).resolves.toBeUndefined()
  })

  it('should create deterministic IDs with createIdBySeed', () => {
    const id1 = createIdBySeed('test-seed', 7, IdType.Default)
    const id2 = createIdBySeed('test-seed', 7, IdType.Default)

    // 同じシードなら同じIDが生成される
    expect(id1).toBe(id2)

    // 正しいフォーマットを持つ
    expect(id1).toMatch(
      /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{7}$/
    )

    // 異なるシードなら異なるIDが生成される
    const id3 = createIdBySeed('different-seed', 7, IdType.Default)
    expect(id1).not.toBe(id3)
  })

  it('should generate random numbers with Gnrng', () => {
    const rng = new Gnrng('test-seed')

    // 乱数が0以上1未満の範囲内であることを確認
    for (let i = 0; i < 10; i++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }

    // 決定的であることを確認
    const rng1 = new Gnrng('deterministic-seed')
    const rng2 = new Gnrng('deterministic-seed')

    const sequence1 = [rng1.next(), rng1.next(), rng1.next()]
    const sequence2 = [rng2.next(), rng2.next(), rng2.next()]

    expect(sequence1).toEqual(sequence2)

    // メモリ解放
    rng.free()
    rng1.free()
    rng2.free()
  })

  it('should handle different ID types correctly', () => {
    const userId = createIdBySeed('user-seed', 8, IdType.User)
    const teamId = createIdBySeed('team-seed', 8, IdType.Team)
    const projectId = createIdBySeed('project-seed', 8, IdType.Project)
    const defaultId = createIdBySeed('default-seed', 8, IdType.Default)

    expect(userId).toMatch(
      /^u_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{8}$/
    )
    expect(teamId).toMatch(
      /^tm_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{8}$/
    )
    expect(projectId).toMatch(
      /^p_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{8}$/
    )
    expect(defaultId).toMatch(
      /^t_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{8}$/
    )
  })

  it('should generate range numbers correctly', () => {
    const rng = new Gnrng('range-test')

    // 範囲内の整数が生成されることを確認
    for (let i = 0; i < 20; i++) {
      const value = rng.nextRange(1, 10)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThan(10)
      expect(Number.isInteger(value)).toBe(true)
    }

    rng.free()
  })

  it('should handle batch operations', () => {
    const rng = new Gnrng('batch-test')

    // バッチで乱数生成
    const batch = rng.nextBatch(5)
    expect(batch).toHaveLength(5)

    // 全て有効な乱数であることを確認
    for (const value of batch) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }

    // 範囲バッチ
    const rangeBatch = rng.nextRangeBatch(10, 20, 3)
    expect(rangeBatch).toHaveLength(3)

    for (const value of rangeBatch) {
      expect(value).toBeGreaterThanOrEqual(10)
      expect(value).toBeLessThan(20)
      expect(Number.isInteger(value)).toBe(true)
    }

    rng.free()
  })
})
