/**
 * @nap5/gnrng-id
 * GNRNG (Good Night Random Number Generator) with ID generation utilities powered by WebAssembly
 */

import init, {
  Gnrng as WasmGnrng,
  IdType as WasmIdType,
  create_id as wasmCreateId,
  create_id_by_seed as wasmCreateIdBySeed,
  get_unique_name as wasmGetUniqueName,
} from '@nap5/gnrng-id-wasm'

// WASMモジュールの初期化状態を管理
let wasmInitialized = false
let initPromise: Promise<void> | null = null

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
 * GNRNG (Good Night Random Number Generator) クラス
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
   * 指定範囲の整数を生成
   */
  nextRange(min: number, max: number): number {
    return this.wasmInstance.next_range(min, max)
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
 * 非同期版: ランダムな ID を生成
 */
export async function createIdAsync(size = 7, type: IdType = IdType.Default): Promise<string> {
  await initWasm()
  return wasmCreateId(size, convertIdType(type))
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
 * 非同期版: 重複を避けたユニークな名前を生成
 */
export async function getNameAsync(baseName: string, existingNames: string[]): Promise<string> {
  await initWasm()
  const jsArray = new Array(...existingNames)
  return wasmGetUniqueName(baseName, jsArray)
}

// 互換性のためのエイリアス（既存のrandUtil.tsとの互換性）
export { createId as createRandomId }
export { createIdBySeed as createDeterministicId }

/**
 * ライブラリ情報
 */
export const version = '0.1.0'
export const name = '@nap5/gnrng-id'

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
}

// デフォルトエクスポート
export default {
  initWasm,
  Gnrng,
  gnrng,
  createId,
  createIdBySeed,
  getName,
  IdType,
  auto,
  version,
  name,
}
