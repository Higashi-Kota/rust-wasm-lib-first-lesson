import { vi } from 'vitest'

// GNRNG-ID WASMモジュールをモック
vi.mock('@nap5/gnrng-id', () => {
  // WASMと同等の動作をするモッククラス
  class MockGnrng {
    private x = 0
    private y = 0
    private z = 0
    private w = 0

    constructor(seed: string) {
      // シード初期化（WASMと同じロジック）
      for (let k = 0; k < seed.length + 64; k++) {
        if (k < seed.length) {
          this.x ^= seed.charCodeAt(k)
        }
        this.nextU32()
      }
    }

    private nextU32(): number {
      // XorShiftアルゴリズム（WASMと同じ）
      const t = this.x ^ (this.x << 11)
      this.x = this.y
      this.y = this.z
      this.z = this.w
      this.w ^= (this.w >>> 19) ^ t ^ (t >>> 8)

      // 符号なし32ビット整数として扱う
      return this.w >>> 0
    }

    next(): number {
      // 0.0 ～ 1.0未満の範囲（WASMと同じ）
      return this.nextU32() / 4294967296.0
    }

    nextBatch(count: number): number[] {
      const result: number[] = []
      for (let i = 0; i < count; i++) {
        result.push(this.next())
      }
      return result
    }

    nextRange(min: number, max: number): number {
      if (min >= max) return min
      const range = max - min
      const value = this.nextU32() % range
      return min + value
    }

    nextRangeBatch(min: number, max: number, count: number): number[] {
      const result: number[] = []
      for (let i = 0; i < count; i++) {
        result.push(this.nextRange(min, max))
      }
      return result
    }

    free(): void {
      // モックなので何もしない
    }
  }

  // IdType enum のモック
  const IdType = {
    User: 'user',
    Team: 'team',
    Project: 'project',
    Default: 'default',
  }

  // シードベースの決定的ID生成（簡易版）
  const createIdBySeedMock = (seed: string, size = 7, type = 'default') => {
    const prefixes = {
      user: 'u_',
      team: 'tm_',
      project: 'p_',
      default: 't_',
    }
    const prefix = prefixes[type as keyof typeof prefixes] || 't_'
    const alphabet =
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff
    }

    let result = ''
    for (let i = 0; i < size; i++) {
      hash = ((hash * 1103515245 + 12345) & 0xffffffff) >>> 0
      result += alphabet[hash % alphabet.length]
    }

    return prefix + result
  }

  return {
    // WASMの初期化関数
    initWasm: vi.fn().mockResolvedValue(undefined),

    // GNRNG クラス
    Gnrng: MockGnrng,

    // ファクトリ関数
    gnrng: vi.fn((seed: string) => new MockGnrng(seed)),

    // ID生成関数
    createIdBySeed: vi.fn(createIdBySeedMock),

    // バッチID生成関数
    createIdsBySeed: vi.fn(
      (baseSeed: string, count: number, size = 7, type = 'default') => {
        const result: string[] = []
        for (let i = 0; i < count; i++) {
          const seed = `${baseSeed}-${i}`
          result.push(createIdBySeedMock(seed, size, type))
        }
        return result
      }
    ),

    // IdType enum
    IdType,
  }
})

// コンソール出力をクリーンに保つ
const originalConsole = global.console
global.console = {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: (...args) => {
    // エラーは実際に出力（重要なものを見逃さないため）
    originalConsole.error(...args)
  },
}
