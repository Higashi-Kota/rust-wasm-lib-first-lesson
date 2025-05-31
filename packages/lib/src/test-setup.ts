import { vi } from 'vitest'

// WASM モジュールをモック
vi.mock('@nap5/gnrng-id-wasm', () => {
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

    next_batch(count: number): number[] {
      const result: number[] = []
      for (let i = 0; i < count; i++) {
        result.push(this.next())
      }
      return result
    }

    next_range(min: number, max: number): number {
      if (min >= max) return min
      const range = max - min
      const value = this.nextU32() % range
      return min + value
    }

    next_range_batch(min: number, max: number, count: number): number[] {
      const result: number[] = []
      for (let i = 0; i < count; i++) {
        result.push(this.next_range(min, max))
      }
      return result
    }

    free(): void {
      // モックなので何もしない
    }
  }

  return {
    default: vi.fn().mockResolvedValue(undefined), // init 関数
    Gnrng: MockGnrng,
  }
})

// コンソール出力をクリーンに保つ
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
