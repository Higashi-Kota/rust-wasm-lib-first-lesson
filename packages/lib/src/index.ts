/**
 * @nap5/gnrng-id
 * GNRNG (Good Night Random Number Generator) with ID generation utilities powered by WebAssembly
 *
 * Architecture:
 * - GNRNG: WASM implementation (high-performance)
 * - ID Generation: TypeScript implementation (compatibility with @internal/utils)
 */

import init, { Gnrng as WasmGnrng } from '@nap5/gnrng-id-wasm'

// TypeScript implementations from @internal/utils for compatibility
import { customRandom } from 'nanoid'

// WASMモジュールの初期化状態を管理
let wasmInitialized = false
let initPromise: Promise<void> | null = null

// パフォーマンス最適化の閾値設定
const OPTIMIZATION_THRESHOLDS = {
  /** バッチ処理に切り替える最小サイズ */
  BATCH_MIN_SIZE: 10,
  /** 大量処理での最大バッチサイズ（メモリ効率のため分割） */
  BATCH_MAX_SIZE: 10000,
  /** GNRNG バッチ処理閾値 */
  GNRNG_BATCH_THRESHOLD: 50,
  /** ID生成バッチ処理閾値 */
  ID_BATCH_THRESHOLD: 20,
  /** 名前生成バッチ処理閾値 */
  NAME_BATCH_THRESHOLD: 5,
} as const

// TypeScript ID generation constants (from @internal/utils)
const AVAILABLE_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * WASMモジュールを初期化する
 * 複数回呼び出されても安全
 */
export async function initWasm(): Promise<void> {
  if (wasmInitialized) {
    return
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = init().then(() => {
    wasmInitialized = true
  })

  return initPromise
}

/**
 * WASM初期化済みかチェックして、未初期化なら例外を投げる
 */
function ensureWasmInitialized(): void {
  if (!wasmInitialized) {
    throw new Error(
      'WASM module not initialized. Call initWasm() first or use the async variants.'
    )
  }
}

/**
 * ID のタイプを表す列挙型
 */
export enum IdType {
  User = 'user',
  Team = 'team',
  Project = 'project',
  Default = 'default',
}

/**
 * プレフィックスを取得
 */
function getPrefix(type: IdType): string {
  switch (type) {
    case IdType.User:
      return 'u_'
    case IdType.Team:
      return 'tm_'
    case IdType.Project:
      return 'p_'
    case IdType.Default:
      return 't_'
    default:
      return 't_'
  }
}

/**
 * 🚀 GNRNG (Good Night Random Number Generator) クラス - WASM実装
 * シードベースの決定的な疑似乱数生成器
 */
export class Gnrng {
  private wasmInstance: WasmGnrng

  constructor(seed: string) {
    ensureWasmInitialized()
    this.wasmInstance = new WasmGnrng(seed)
  }

  /**
   * 次の疑似乱数値（0.0 ～ 1.0未満）を生成
   */
  next(): number {
    return this.wasmInstance.next()
  }

  /**
   * 🚀 バッチ乱数生成: 指定回数分の乱数を高速一括生成
   * @param count 生成する乱数の個数
   * @returns 乱数の配列
   */
  nextBatch(count: number): number[] {
    if (count <= 0) return []
    if (count > OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE) {
      // 大量処理時は分割して処理（メモリ効率化）
      return this.nextBatchChunked(count)
    }
    return [...this.wasmInstance.next_batch(count)]
  }

  /**
   * 大量バッチを分割処理（メモリ効率化）
   */
  private nextBatchChunked(count: number): number[] {
    const result: number[] = []
    const chunkSize = OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE

    for (let i = 0; i < count; i += chunkSize) {
      const currentChunkSize = Math.min(chunkSize, count - i)
      const chunk = this.wasmInstance.next_batch(currentChunkSize)
      result.push(...chunk)
    }

    return result
  }

  /**
   * 指定範囲の整数を生成
   */
  nextRange(min: number, max: number): number {
    return this.wasmInstance.next_range(min, max)
  }

  /**
   * 🚀 バッチ範囲乱数生成: 指定回数分の範囲乱数を高速一括生成
   * @param min 最小値（含む）
   * @param max 最大値（含まない）
   * @param count 生成する乱数の個数
   * @returns 範囲乱数の配列
   */
  nextRangeBatch(min: number, max: number, count: number): number[] {
    if (count <= 0) return []
    if (count > OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE) {
      // 大量処理時は分割して処理
      return this.nextRangeBatchChunked(min, max, count)
    }
    return [...this.wasmInstance.next_range_batch(min, max, count)]
  }

  /**
   * 大量範囲バッチを分割処理
   */
  private nextRangeBatchChunked(
    min: number,
    max: number,
    count: number
  ): number[] {
    const result: number[] = []
    const chunkSize = OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE

    for (let i = 0; i < count; i += chunkSize) {
      const currentChunkSize = Math.min(chunkSize, count - i)
      const chunk = this.wasmInstance.next_range_batch(
        min,
        max,
        currentChunkSize
      )
      result.push(...chunk)
    }

    return result
  }

  /**
   * WASMインスタンスを解放（ガベージコレクション用）
   */
  free(): void {
    this.wasmInstance.free()
  }
}

/**
 * シードから GNRNG インスタンスを作成（WASM実装）
 * @param seed シード文字列
 * @returns GNRNG インスタンス
 */
export function gnrng(seed: string): Gnrng {
  return new Gnrng(seed)
}

/**
 * シードベースで決定的な ID を生成（WASM gnrng + TypeScript ID生成）
 * @param seed シード文字列
 * @param size ID のサイズ（デフォルト: 7）
 * @param type ID のタイプ（デフォルト: Default）
 * @returns 生成された ID
 */
export function createIdBySeed(
  seed: string,
  size = 7,
  type: IdType = IdType.Default
): string {
  ensureWasmInitialized()

  const rng = new Gnrng(seed)
  const prefix = getPrefix(type)

  try {
    const nanoid = customRandom(AVAILABLE_ALPHABET, size, (size) => {
      return new Uint8Array(size).map(() => 256 * rng.next())
    })

    return `${prefix}${nanoid()}`
  } finally {
    rng.free()
  }
}

/**
 * 🚀 バッチシードID生成: 異なるシードから複数のIDを高速生成
 * @param baseSeed ベースシード文字列
 * @param count 生成するIDの個数
 * @param size ID のサイズ（デフォルト: 7）
 * @param type ID のタイプ（デフォルト: Default）
 * @returns 生成されたIDの配列
 */
export function createIdsBySeed(
  baseSeed: string,
  count: number,
  size = 7,
  type: IdType = IdType.Default
): string[] {
  ensureWasmInitialized()

  if (count <= 0) return []

  const prefix = getPrefix(type)
  const results: string[] = []

  // 各IDに異なるシードを使用
  for (let i = 0; i < count; i++) {
    const rng = new Gnrng(`${baseSeed}-${i}`)

    try {
      const nanoid = customRandom(AVAILABLE_ALPHABET, size, (size) => {
        return new Uint8Array(size).map(() => 256 * rng.next())
      })

      results.push(`${prefix}${nanoid()}`)
    } finally {
      rng.free()
    }
  }

  return results
}
