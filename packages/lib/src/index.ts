/**
 * @nap5/gnrng-id
 * GNRNG (Good Night Random Number Generator) with ID generation utilities powered by WebAssembly
 */

import init, {
  Gnrng as WasmGnrng,
  IdType as WasmIdType,
  create_id as wasmCreateId,
  create_id_by_seed as wasmCreateIdBySeed,
  create_ids as wasmCreateIds,
  create_ids_by_seed as wasmCreateIdsBySeed,
  create_deterministic_ids_by_seed as wasmCreateDeterministicIdsBySeed,
  get_unique_name as wasmGetUniqueName,
  get_unique_names as wasmGetUniqueNames,
} from '@nap5/gnrng-id-wasm'

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
    throw new Error('WASM module not initialized. Call initWasm() first or use the async variants.')
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
 * TypeScript IdType を WASM IdType に変換
 */
function convertIdType(type: IdType): WasmIdType {
  switch (type) {
    case IdType.User:
      return WasmIdType.User
    case IdType.Team:
      return WasmIdType.Team
    case IdType.Project:
      return WasmIdType.Project
    case IdType.Default:
      return WasmIdType.Default
    default:
      return WasmIdType.Default
  }
}

/**
 * 🚀 GNRNG (Good Night Random Number Generator) クラス - バッチ最適化版
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
    return this.wasmInstance.next_batch(count)
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
    return this.wasmInstance.next_range_batch(min, max, count)
  }

  /**
   * 大量範囲バッチを分割処理
   */
  private nextRangeBatchChunked(min: number, max: number, count: number): number[] {
    const result: number[] = []
    const chunkSize = OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE

    for (let i = 0; i < count; i += chunkSize) {
      const currentChunkSize = Math.min(chunkSize, count - i)
      const chunk = this.wasmInstance.next_range_batch(min, max, currentChunkSize)
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
 * シードから GNRNG インスタンスを作成
 * @param seed シード文字列
 * @returns GNRNG インスタンス
 */
export function gnrng(seed: string): Gnrng {
  return new Gnrng(seed)
}

/**
 * 非同期版: シードから GNRNG インスタンスを作成
 */
export async function gnrngAsync(seed: string): Promise<Gnrng> {
  await initWasm()
  return new Gnrng(seed)
}

/**
 * ランダムな ID を生成
 * @param size ID のサイズ（デフォルト: 7）
 * @param type ID のタイプ（デフォルト: Default）
 * @returns 生成された ID
 */
export function createId(size = 7, type: IdType = IdType.Default): string {
  ensureWasmInitialized()
  return wasmCreateId(size, convertIdType(type))
}

/**
 * 🚀 バッチID生成: 複数のランダムIDを高速一括生成
 * @param count 生成するIDの個数
 * @param size ID のサイズ（デフォルト: 7）
 * @param type ID のタイプ（デフォルト: Default）
 * @returns 生成されたIDの配列
 */
export function createIds(count: number, size = 7, type: IdType = IdType.Default): string[] {
  ensureWasmInitialized()

  if (count <= 0) return []
  if (count === 1) {
    // 単体の場合は個別関数を使用（最適化）
    return [wasmCreateId(size, convertIdType(type))]
  }
  if (count > OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE) {
    // 大量処理時は分割して処理
    return createIdsChunked(count, size, type)
  }

  return wasmCreateIds(count, size, convertIdType(type))
}

/**
 * 大量ID生成を分割処理
 */
function createIdsChunked(count: number, size: number, type: IdType): string[] {
  const result: string[] = []
  const chunkSize = OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE
  const wasmType = convertIdType(type)

  for (let i = 0; i < count; i += chunkSize) {
    const currentChunkSize = Math.min(chunkSize, count - i)
    const chunk = wasmCreateIds(currentChunkSize, size, wasmType)
    result.push(...chunk)
  }

  return result
}

/**
 * 非同期版: ランダムな ID を生成
 */
export async function createIdAsync(size = 7, type: IdType = IdType.Default): Promise<string> {
  await initWasm()
  return wasmCreateId(size, convertIdType(type))
}

/**
 * 🚀 非同期版: バッチID生成
 */
export async function createIdsAsync(
  count: number,
  size = 7,
  type: IdType = IdType.Default
): Promise<string[]> {
  await initWasm()
  return createIds(count, size, type)
}

/**
 * シードベースで決定的な ID を生成
 * @param seed シード文字列
 * @param size ID のサイズ（デフォルト: 7）
 * @param type ID のタイプ（デフォルト: Default）
 * @returns 生成された ID
 */
export function createIdBySeed(seed: string, size = 7, type: IdType = IdType.Default): string {
  ensureWasmInitialized()
  return wasmCreateIdBySeed(seed, size, convertIdType(type))
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
  if (count === 1) {
    return [wasmCreateIdBySeed(baseSeed, size, convertIdType(type))]
  }
  if (count > OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE) {
    return createIdsBySeedChunked(baseSeed, count, size, type)
  }

  return wasmCreateIdsBySeed(baseSeed, count, size, convertIdType(type))
}

/**
 * 大量シードID生成を分割処理
 */
function createIdsBySeedChunked(
  baseSeed: string,
  count: number,
  size: number,
  type: IdType
): string[] {
  const result: string[] = []
  const chunkSize = OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE
  const wasmType = convertIdType(type)

  for (let i = 0; i < count; i += chunkSize) {
    const currentChunkSize = Math.min(chunkSize, count - i)
    const chunkBaseSeed = `${baseSeed}-chunk-${Math.floor(i / chunkSize)}`
    const chunk = wasmCreateIdsBySeed(chunkBaseSeed, currentChunkSize, size, wasmType)
    result.push(...chunk)
  }

  return result
}

/**
 * 🚀 決定的シードID生成: 同一シードから複数の決定的IDを生成
 * @param seed シード文字列
 * @param count 生成するIDの個数
 * @param size ID のサイズ（デフォルト: 7）
 * @param type ID のタイプ（デフォルト: Default）
 * @returns 生成されたIDの配列
 */
export function createDeterministicIdsBySeed(
  seed: string,
  count: number,
  size = 7,
  type: IdType = IdType.Default
): string[] {
  ensureWasmInitialized()

  if (count <= 0) return []
  if (count === 1) {
    return [wasmCreateIdBySeed(seed, size, convertIdType(type))]
  }
  if (count > OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE) {
    return createDeterministicIdsBySeedChunked(seed, count, size, type)
  }

  return wasmCreateDeterministicIdsBySeed(seed, count, size, convertIdType(type))
}

/**
 * 大量決定的ID生成を分割処理
 */
function createDeterministicIdsBySeedChunked(
  seed: string,
  count: number,
  size: number,
  type: IdType
): string[] {
  const result: string[] = []
  const chunkSize = OPTIMIZATION_THRESHOLDS.BATCH_MAX_SIZE
  const wasmType = convertIdType(type)

  for (let i = 0; i < count; i += chunkSize) {
    const currentChunkSize = Math.min(chunkSize, count - i)

    // 決定的な分割のため、シードにオフセットを含める
    const rng = new Gnrng(`${seed}-offset-${i}`)

    // チャンク内でのIDを生成
    const chunk: string[] = []
    for (let j = 0; j < currentChunkSize; j++) {
      const id = wasmCreateIdBySeed(`${seed}-${i + j}`, size, wasmType)
      chunk.push(id)
    }

    rng.free()
    result.push(...chunk)
  }

  return result
}

/**
 * 非同期版: シードベースで決定的な ID を生成
 */
export async function createIdBySeedAsync(
  seed: string,
  size = 7,
  type: IdType = IdType.Default
): Promise<string> {
  await initWasm()
  return wasmCreateIdBySeed(seed, size, convertIdType(type))
}

/**
 * 🚀 非同期版: バッチシードID生成
 */
export async function createIdsBySeedAsync(
  baseSeed: string,
  count: number,
  size = 7,
  type: IdType = IdType.Default
): Promise<string[]> {
  await initWasm()
  return createIdsBySeed(baseSeed, count, size, type)
}

/**
 * 重複を避けたユニークな名前を生成
 * @param baseName ベースとなる名前
 * @param existingNames 既存の名前の配列
 * @returns ユニークな名前
 */
export function getName(baseName: string, existingNames: string[]): string {
  ensureWasmInitialized()
  // JavaScript配列をJSArrayに変換
  const jsArray = new Array(...existingNames)
  return wasmGetUniqueName(baseName, jsArray)
}

/**
 * 🚀 バッチユニーク名生成: 複数のベース名を一括でユニーク名に変換
 * @param baseNames ベースとなる名前の配列
 * @param existingNames 既存の名前の配列
 * @returns ユニークな名前の配列
 */
export function getNames(baseNames: string[], existingNames: string[]): string[] {
  ensureWasmInitialized()

  if (baseNames.length === 0) return []
  if (baseNames.length === 1) {
    return [getName(baseNames[0], existingNames)]
  }
  if (baseNames.length < OPTIMIZATION_THRESHOLDS.NAME_BATCH_THRESHOLD) {
    // 少数の場合は個別処理の方が効率的
    const result: string[] = []
    const used = new Set(existingNames)

    for (const baseName of baseNames) {
      const uniqueName = getName(baseName, Array.from(used))
      used.add(uniqueName)
      result.push(uniqueName)
    }

    return result
  }

  // バッチ処理
  const baseNamesArray = new Array(...baseNames)
  const existingNamesArray = new Array(...existingNames)
  return wasmGetUniqueNames(baseNamesArray, existingNamesArray)
}

/**
 * 非同期版: 重複を避けたユニークな名前を生成
 */
export async function getNameAsync(baseName: string, existingNames: string[]): Promise<string> {
  await initWasm()
  const jsArray = new Array(...existingNames)
  return wasmGetUniqueName(baseName, jsArray)
}

/**
 * 🚀 非同期版: バッチユニーク名生成
 */
export async function getNamesAsync(
  baseNames: string[],
  existingNames: string[]
): Promise<string[]> {
  await initWasm()
  return getNames(baseNames, existingNames)
}

// 互換性のためのエイリアス（既存のrandUtil.tsとの互換性）
export { createId as createRandomId }
export { createIdBySeed as createDeterministicId }

/**
 * 🚀 スマート最適化ユーティリティ
 * 使用パターンに応じて最適なAPIを自動選択
 */
export namespace smart {
  /**
   * スマートGNRNG: 使用パターンに応じて最適化を自動適用
   */
  export class SmartGnrng {
    private rng: Gnrng
    private pendingRequests: Array<{
      type: 'next' | 'range'
      min?: number
      max?: number
    }> = []
    private batchTimeout: ReturnType<typeof setTimeout> | null = null

    constructor(seed: string) {
      this.rng = new Gnrng(seed)
    }

    /**
     * 乱数生成（バッチ最適化付き）
     */
    next(): Promise<number> {
      return new Promise((resolve) => {
        this.pendingRequests.push({ type: 'next' })
        this.scheduleFlush(() => {
          const results = this.rng.nextBatch(this.pendingRequests.length)
          resolve(results[this.pendingRequests.length - 1])
        })
      })
    }

    /**
     * 範囲乱数生成（バッチ最適化付き）
     */
    nextRange(min: number, max: number): Promise<number> {
      return new Promise((resolve) => {
        this.pendingRequests.push({ type: 'range', min, max })
        this.scheduleFlush(() => {
          const results = this.rng.nextRangeBatch(min, max, this.pendingRequests.length)
          resolve(results[this.pendingRequests.length - 1])
        })
      })
    }

    private scheduleFlush(resolver: () => void): void {
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      // 即座にバッチサイズに達した場合は即実行
      if (this.pendingRequests.length >= OPTIMIZATION_THRESHOLDS.GNRNG_BATCH_THRESHOLD) {
        this.flush()
        resolver()
        return
      }

      // 少し待ってバッチ化
      this.batchTimeout = setTimeout(() => {
        this.flush()
        resolver()
      }, 1)
    }

    private flush(): void {
      this.pendingRequests = []
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
        this.batchTimeout = null
      }
    }

    free(): void {
      this.flush()
      this.rng.free()
    }
  }

  /**
   * スマートID生成: バッチサイズに応じて最適なAPIを選択
   */
  export function createIds(count: number, size = 7, type: IdType = IdType.Default): string[] {
    if (count < OPTIMIZATION_THRESHOLDS.ID_BATCH_THRESHOLD) {
      // 少数の場合は個別生成
      return Array.from({ length: count }, () => createId(size, type))
    }
    // 多数の場合はバッチ生成
    return createIds(count, size, type)
  }
}

/**
 * ライブラリ情報
 */
export const version = '0.1.0'
export const name = '@nap5/gnrng-id'

/**
 * パフォーマンス設定の取得/変更
 */
export const performance = {
  /**
   * 現在の最適化閾値を取得
   */
  getThresholds: () => ({ ...OPTIMIZATION_THRESHOLDS }),

  /**
   * バッチ処理の統計情報（開発/デバッグ用）
   */
  getStats: () => ({
    wasmInitialized,
    thresholds: OPTIMIZATION_THRESHOLDS,
    version,
    name,
  }),
} as const

/**
 * 利便性のため、自動初期化する関数群
 * これらは初回呼び出し時に自動的にWASMを初期化します
 */
export namespace auto {
  /**
   * 自動初期化付き: ランダムな ID を生成
   */
  export async function createId(size = 7, type: IdType = IdType.Default): Promise<string> {
    return createIdAsync(size, type)
  }

  /**
   * 🚀 自動初期化付き: バッチID生成
   */
  export async function createIds(
    count: number,
    size = 7,
    type: IdType = IdType.Default
  ): Promise<string[]> {
    return createIdsAsync(count, size, type)
  }

  /**
   * 自動初期化付き: シードベースで決定的な ID を生成
   */
  export async function createIdBySeed(
    seed: string,
    size = 7,
    type: IdType = IdType.Default
  ): Promise<string> {
    return createIdBySeedAsync(seed, size, type)
  }

  /**
   * 🚀 自動初期化付き: バッチシードID生成
   */
  export async function createIdsBySeed(
    baseSeed: string,
    count: number,
    size = 7,
    type: IdType = IdType.Default
  ): Promise<string[]> {
    return createIdsBySeedAsync(baseSeed, count, size, type)
  }

  /**
   * 自動初期化付き: GNRNG インスタンスを作成
   */
  export async function gnrng(seed: string): Promise<Gnrng> {
    return gnrngAsync(seed)
  }

  /**
   * 自動初期化付き: ユニークな名前を生成
   */
  export async function getName(baseName: string, existingNames: string[]): Promise<string> {
    return getNameAsync(baseName, existingNames)
  }

  /**
   * 🚀 自動初期化付き: バッチユニーク名生成
   */
  export async function getNames(baseNames: string[], existingNames: string[]): Promise<string[]> {
    return getNamesAsync(baseNames, existingNames)
  }
}

// デフォルトエクスポート
export default {
  initWasm,
  Gnrng,
  gnrng,
  createId,
  createIds,
  createIdBySeed,
  createIdsBySeed,
  createDeterministicIdsBySeed,
  getName,
  getNames,
  IdType,
  auto,
  smart,
  performance,
  version,
  name,
}
