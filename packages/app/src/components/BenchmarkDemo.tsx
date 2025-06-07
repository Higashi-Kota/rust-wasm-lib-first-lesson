import { useState } from 'react'

// WASM implementation
import {
  IdType,
  Gnrng as WasmGnrng,
  createIdBySeed as wasmCreateIdBySeed,
  createIdsBySeed as wasmCreateIdsBySeed,
} from '@nap5/gnrng-id'

// TypeScript implementation for comparison
import {
  createIdBySeed as utilsCreateIdBySeed,
  gnrng as utilsGnrng,
} from '@internal/utils'

interface BenchmarkResult {
  name: string
  description: string
  wasmTime: number
  wasmBatchTime?: number
  tsTime: number
  improvement: number
  batchImprovement?: number
  iterations: number
  timestamp: Date
  category: 'gnrng' | 'id-generation' | 'mixed'
  executionNumber?: number
}

const PRESET_SIZES = [
  { value: '100', label: '100 (小)' },
  { value: '1000', label: '1,000 (中)' },
  { value: '5000', label: '5,000 (大)' },
  { value: '10000', label: '10,000 (超大)' },
] as const

// ベンチマークテストの定義
const BENCHMARK_TESTS = [
  {
    id: 'gnrng-batch',
    name: 'GNRNG 乱数生成',
    category: 'gnrng' as const,
    icon: '🎲',
    description: '個別 vs バッチ乱数生成のパフォーマンス比較',
  },
  {
    id: 'gnrng-range-batch',
    name: 'GNRNG 範囲乱数生成',
    category: 'gnrng' as const,
    icon: '🎯',
    description: '指定範囲内の整数生成（個別 vs バッチ）',
  },
  {
    id: 'create-id-seeded-batch',
    name: 'シードID生成',
    category: 'id-generation' as const,
    icon: '🆔',
    description: '決定的ID生成（個別 vs バッチ）',
  },
  {
    id: 'mixed-operations',
    name: '混合処理',
    category: 'mixed' as const,
    icon: '🔄',
    description: '乱数 + ID生成の組み合わせ処理',
  },
] as const

export function BenchmarkDemo() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [selectedTests, setSelectedTests] = useState<string[]>(['gnrng-batch'])
  const [iterations, setIterations] = useState<string>('1000')
  const [batchSize, setBatchSize] = useState<string>('1000')
  const [executionCount, setExecutionCount] = useState<number>(0)

  const runBenchmark = async (
    name: string,
    description: string,
    wasmFn: () => void,
    wasmBatchFn: (() => void) | null,
    tsFn: () => void,
    iterationCount: number,
    category: BenchmarkResult['category']
  ): Promise<BenchmarkResult> => {
    // Warm up
    for (let i = 0; i < 5; i++) {
      wasmFn()
      if (wasmBatchFn) wasmBatchFn()
      tsFn()
    }

    // Benchmark WASM Individual
    const wasmStart = performance.now()
    for (let i = 0; i < iterationCount; i++) {
      wasmFn()
    }
    const wasmEnd = performance.now()
    const wasmTime = wasmEnd - wasmStart

    // Benchmark WASM Batch (if available)
    let wasmBatchTime: number | undefined
    let batchImprovement: number | undefined
    if (wasmBatchFn) {
      const wasmBatchStart = performance.now()
      wasmBatchFn()
      const wasmBatchEnd = performance.now()
      wasmBatchTime = wasmBatchEnd - wasmBatchStart
      batchImprovement = wasmTime / wasmBatchTime
    }

    // Benchmark TypeScript
    const tsStart = performance.now()
    for (let i = 0; i < iterationCount; i++) {
      tsFn()
    }
    const tsEnd = performance.now()
    const tsTime = tsEnd - tsStart

    const improvement = tsTime / (wasmBatchTime || wasmTime)

    return {
      name,
      description,
      wasmTime,
      wasmBatchTime,
      tsTime,
      improvement,
      batchImprovement,
      iterations: iterationCount,
      timestamp: new Date(),
      category,
    }
  }

  const runSingleBenchmark = async (
    testId: string
  ): Promise<BenchmarkResult> => {
    const iterationCount = Number.parseInt(iterations)
    const batchCount = Number.parseInt(batchSize)

    switch (testId) {
      case 'gnrng-batch':
        return await runBenchmark(
          'GNRNG 乱数生成',
          `個別 vs バッチ (${batchCount}個ずつ)`,
          () => {
            const rng = new WasmGnrng('benchmark-seed')
            rng.next()
            rng.free()
          },
          () => {
            const rng = new WasmGnrng('benchmark-seed')
            rng.nextBatch(batchCount)
            rng.free()
          },
          () => {
            const rng = utilsGnrng('benchmark-seed')
            rng()
          },
          iterationCount,
          'gnrng'
        )

      case 'gnrng-range-batch':
        return await runBenchmark(
          'GNRNG 範囲乱数生成',
          `範囲乱数: 個別 vs バッチ (${batchCount}個ずつ)`,
          () => {
            const rng = new WasmGnrng('benchmark-seed')
            rng.nextRange(1, 100)
            rng.free()
          },
          () => {
            const rng = new WasmGnrng('benchmark-seed')
            rng.nextRangeBatch(1, 100, batchCount)
            rng.free()
          },
          () => {
            const rng = utilsGnrng('benchmark-seed')
            const value = rng()
            Math.floor(value * 99) + 1
          },
          iterationCount,
          'gnrng'
        )

      case 'create-id-seeded-batch':
        return await runBenchmark(
          'シードID生成',
          `個別 vs バッチ (${batchCount}個ずつ)`,
          () => wasmCreateIdBySeed('test-seed', 7, IdType.Default),
          () => wasmCreateIdsBySeed('test-seed', batchCount, 7, IdType.Default),
          () => utilsCreateIdBySeed('test-seed', 7, 'default'),
          iterationCount,
          'id-generation'
        )

      case 'mixed-operations':
        return await runBenchmark(
          '混合処理',
          `乱数 + ID生成の組み合わせ (${Math.min(batchCount, 100)}処理ずつ)`,
          () => {
            const rng = new WasmGnrng('mixed-seed')
            rng.next()
            rng.free()
            wasmCreateIdBySeed('mixed-id', 7, IdType.Default)
          },
          () => {
            const rng = new WasmGnrng('mixed-seed')
            rng.nextBatch(Math.min(batchCount, 100))
            rng.free()
            wasmCreateIdsBySeed(
              'mixed-id',
              Math.min(batchCount, 100),
              7,
              IdType.Default
            )
          },
          () => {
            const rng = utilsGnrng('mixed-seed')
            rng()
            utilsCreateIdBySeed('mixed-id', 7, 'default')
          },
          Math.floor(iterationCount / 10),
          'mixed'
        )

      default:
        throw new Error('不明なテストタイプです')
    }
  }

  const handleRunSelectedBenchmarks = async () => {
    if (isRunning || selectedTests.length === 0) return

    setIsRunning(true)

    // 実行回数をインクリメント
    const currentExecution = executionCount + 1
    setExecutionCount(currentExecution)

    try {
      const iterationCount = Number.parseInt(iterations)
      const batchCount = Number.parseInt(batchSize)

      if (
        Number.isNaN(iterationCount) ||
        iterationCount < 10 ||
        iterationCount > 100000
      ) {
        throw new Error('反復回数は10〜100,000の範囲で指定してください')
      }

      if (Number.isNaN(batchCount) || batchCount < 10 || batchCount > 100000) {
        throw new Error('バッチサイズは10〜100,000の範囲で指定してください')
      }

      const newResults: BenchmarkResult[] = []

      for (const testId of selectedTests) {
        console.log(`🚀 実行中: ${testId}`)
        const result = await runSingleBenchmark(testId)
        // 実行回数を結果に追加
        const resultWithExecution = {
          ...result,
          executionNumber: currentExecution,
        }
        newResults.push(resultWithExecution)

        // 進捗の視覚化のため少し待機
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      setResults((prev) => [
        ...newResults,
        ...prev.slice(0, 15 - newResults.length),
      ])
    } catch (error) {
      console.error('ベンチマーク実行エラー:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'ベンチマーク実行中にエラーが発生しました'
      )
    } finally {
      setIsRunning(false)
    }
  }

  const handleTestSelection = (testId: string, checked: boolean) => {
    if (checked) {
      setSelectedTests((prev) => [...prev, testId])
    } else {
      setSelectedTests((prev) => prev.filter((id) => id !== testId))
    }
  }

  const getImprovementColor = (improvement: number): string => {
    if (improvement >= 20) return 'text-green-600'
    if (improvement >= 10) return 'text-blue-600'
    if (improvement >= 5) return 'text-indigo-600'
    if (improvement >= 2) return 'text-yellow-600'
    if (improvement >= 1) return 'text-gray-600'
    return 'text-red-600'
  }

  const getImprovementBadge = (improvement: number): string => {
    if (improvement >= 20) return '🚀'
    if (improvement >= 10) return '⚡'
    if (improvement >= 5) return '🔥'
    if (improvement >= 2) return '📈'
    if (improvement >= 1) return '✅'
    return '❌'
  }

  const getCategoryBadge = (category: BenchmarkResult['category']): string => {
    switch (category) {
      case 'gnrng':
        return '🎲 乱数生成'
      case 'id-generation':
        return '🆔 ID生成'
      case 'mixed':
        return '🔄 混合処理'
    }
  }

  return (
    <section className="card">
      <h3 className="flex items-center section-title">
        <span className="mr-2">🚀</span>
        GNRNG-ID Performance Benchmark
      </h3>

      <div className="space-y-6">
        {/* Test Configuration */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-3 font-semibold text-blue-900">
            🎯 ベンチマーク設定
          </h4>
          <div className="space-y-4">
            {/* テスト選択（チェックボックスグループ） */}
            <div>
              <div className="block mb-2 text-sm font-medium text-blue-800">
                実行するテスト（複数選択可）:
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {BENCHMARK_TESTS.map((test) => (
                  <label
                    key={test.id}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTests.includes(test.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={(e) =>
                        handleTestSelection(test.id, e.target.checked)
                      }
                      disabled={isRunning}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <span className="mr-2">{test.icon}</span>
                        <span className="font-medium text-gray-900">
                          {test.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {test.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* パラメータ設定 */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="iterations-input"
                  className="text-sm font-medium text-blue-800"
                >
                  反復回数:
                </label>
                <input
                  id="iterations-input"
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(e.target.value)}
                  className="w-24 input"
                  min="10"
                  max="100000"
                  disabled={isRunning}
                />
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="batch-size-input"
                  className="text-sm font-medium text-blue-800"
                >
                  バッチサイズ:
                </label>
                <select
                  id="batch-size-input"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  className="input"
                  disabled={isRunning}
                >
                  {PRESET_SIZES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 実行ボタン */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRunSelectedBenchmarks}
                disabled={isRunning || selectedTests.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                {isRunning
                  ? `⏳ 実行中... (${selectedTests.length}件)`
                  : `🚀 選択したテストを実行 (${selectedTests.length}件)`}
              </button>
            </div>

            {/* 選択状況の表示 */}
            {selectedTests.length > 0 && (
              <div className="text-sm text-blue-700">
                <span className="font-medium">選択中:</span>{' '}
                {selectedTests
                  .map((id) => BENCHMARK_TESTS.find((t) => t.id === id)?.name)
                  .join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Progress */}
        {isRunning && (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-3 border-2 border-yellow-600 rounded-full animate-spin border-t-transparent" />
              <span className="text-yellow-800">
                ベンチマーク実行中: {selectedTests.length}件のテスト
                (バッチサイズ: {batchSize}, 反復: {iterations}回)
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h4 className="mb-4 font-semibold text-gray-700">
              🚀 パフォーマンス結果
            </h4>

            {/* 実行回数毎にグループ化 */}
            {(() => {
              // executionNumber でグループ化
              const sessions: { [key: number]: BenchmarkResult[] } = {}

              for (const result of results) {
                const execNum = result.executionNumber || 0
                if (!sessions[execNum]) {
                  sessions[execNum] = []
                }
                sessions[execNum].push(result)
              }

              // 実行番号の降順でソート（新しい実行が上に来る）
              const sortedSessions = Object.entries(sessions).sort(
                ([a], [b]) => Number(b) - Number(a)
              )

              return sortedSessions.map(([executionNumber, session]) => (
                <div key={executionNumber} className="mb-6">
                  {/* セッションヘッダー */}
                  <div className="flex items-center justify-between p-3 mb-3 border rounded-lg bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg font-bold text-slate-700">
                        #{executionNumber}回目の実行
                      </span>
                      <span className="text-sm text-slate-500">
                        {session[0].timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {session.length}件のテスト
                    </div>
                  </div>

                  {/* コンパクトグリッド表示 */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {session.map((result) => (
                      <div
                        key={`${result.name}-${result.timestamp.getTime()}`}
                        className="p-3 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md"
                      >
                        {/* テスト名とバッジ */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="mr-2 text-sm">
                              {getImprovementBadge(result.improvement)}
                            </span>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">
                                {result.name}
                              </h5>
                              <div className="text-xs text-gray-500">
                                {getCategoryBadge(result.category)}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {result.timestamp.toLocaleTimeString()}
                          </div>
                        </div>

                        {/* コンパクトメトリクス */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 text-center border border-orange-200 rounded bg-orange-50">
                            <div className="text-xs font-medium text-orange-600">
                              🦀 WASM
                            </div>
                            <div className="text-sm font-bold text-orange-800">
                              {result.wasmTime.toFixed(2)}ms
                            </div>
                          </div>

                          <div className="p-2 text-center border border-blue-200 rounded bg-blue-50">
                            <div className="text-xs font-medium text-blue-600">
                              📝 TS
                            </div>
                            <div className="text-sm font-bold text-blue-800">
                              {result.tsTime.toFixed(2)}ms
                            </div>
                          </div>

                          {result.wasmBatchTime !== undefined && (
                            <>
                              <div className="p-2 text-center border border-green-200 rounded bg-green-50">
                                <div className="text-xs font-medium text-green-600">
                                  🚀 バッチ
                                </div>
                                <div className="text-sm font-bold text-green-800">
                                  {result.wasmBatchTime.toFixed(2)}ms
                                </div>
                              </div>

                              <div className="p-2 text-center border border-purple-200 rounded bg-purple-50">
                                <div className="text-xs font-medium text-purple-600">
                                  ⚡ 改善
                                </div>
                                <div
                                  className={`text-sm font-bold ${getImprovementColor(result.improvement)}`}
                                >
                                  {result.improvement.toFixed(1)}x
                                </div>
                              </div>
                            </>
                          )}

                          {result.wasmBatchTime === undefined && (
                            <div className="col-span-2 p-2 text-center border border-purple-200 rounded bg-purple-50">
                              <div className="text-xs font-medium text-purple-600">
                                ⚡ 速度改善
                              </div>
                              <div
                                className={`text-sm font-bold ${getImprovementColor(result.improvement)}`}
                              >
                                {result.improvement.toFixed(1)}x faster
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 縦並びプログレスバー */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              パフォーマンス比較
                            </span>
                            <span className="text-xs text-gray-500">
                              {(
                                ((result.tsTime -
                                  (result.wasmBatchTime || result.wasmTime)) /
                                  result.tsTime) *
                                100
                              ).toFixed(1)}
                              % ↑
                            </span>
                          </div>

                          {/* TypeScript (基準) */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-600">
                                📝 TypeScript
                              </span>
                              <span className="text-blue-600">
                                {result.tsTime.toFixed(2)}ms
                              </span>
                            </div>
                            <div className="w-full h-2 bg-blue-200 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>

                          {/* WASM Individual */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-orange-600">🦀 WASM</span>
                              <span className="text-orange-600">
                                {result.wasmTime.toFixed(2)}ms
                              </span>
                            </div>
                            <div className="w-full h-2 bg-orange-200 rounded-full">
                              <div
                                className="h-full transition-all duration-300 bg-orange-500 rounded-full"
                                style={{
                                  width: `${Math.min(95, Math.max(5, (result.wasmTime / result.tsTime) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* WASM Batch (if available) */}
                          {result.wasmBatchTime !== undefined && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-green-600">
                                  🚀 WASMバッチ
                                </span>
                                <span className="text-green-600">
                                  {result.wasmBatchTime.toFixed(2)}ms
                                </span>
                              </div>
                              <div className="w-full h-2 bg-green-200 rounded-full">
                                <div
                                  className="h-full transition-all duration-300 bg-green-500 rounded-full"
                                  style={{
                                    width: `${Math.min(95, Math.max(5, (result.wasmBatchTime / result.tsTime) * 100))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 詳細情報（クリックで展開） */}
                        <details className="mt-3">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            📊 詳細を表示
                          </summary>
                          <div className="p-2 mt-2 space-y-1 text-xs rounded bg-gray-50">
                            <div>{result.description}</div>
                            <div>
                              反復回数: {result.iterations.toLocaleString()}回
                            </div>
                            {result.batchImprovement && (
                              <div className="text-green-600">
                                バッチは個別の
                                {result.batchImprovement.toFixed(1)}倍高速
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        )}

        {/* Performance Summary */}
        {results.length >= 2 && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <h5 className="mb-3 text-sm font-medium text-green-900">
              📊 パフォーマンスサマリー
            </h5>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {(
                    results.reduce((acc, r) => acc + r.improvement, 0) /
                    results.length
                  ).toFixed(1)}
                  x
                </div>
                <div className="text-sm text-green-600">平均速度向上</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {Math.max(...results.map((r) => r.improvement)).toFixed(1)}x
                </div>
                <div className="text-sm text-blue-600">最大速度向上</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {results.filter((r) => r.improvement >= 10).length}
                </div>
                <div className="text-sm text-purple-600">10x以上達成テスト</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h5 className="mb-2 text-sm font-medium text-gray-900">
            ℹ️ GNRNG-IDについて
          </h5>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              • <strong>🎲 GNRNG:</strong>{' '}
              シードベースの決定的疑似乱数生成器（WASM実装）
            </p>
            <p>
              • <strong>🆔 ID生成:</strong> 高性能なユニークID生成（WASM +
              TypeScript）
            </p>
            <p>
              • <strong>🚀 バッチ処理:</strong>{' '}
              FFI境界コストを削減する一括処理API
            </p>
            <p>
              • <strong>⚡ 期待効果:</strong> TypeScript比5-20倍の高速化を実現
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <h5 className="mb-2 text-sm font-medium text-yellow-900">
            💡 使用のコツ
          </h5>
          <div className="grid gap-2 text-sm text-yellow-800 sm:grid-cols-2">
            <div>• 複数のテストを同時に実行して比較</div>
            <div>• 大量処理はバッチAPIを活用</div>
            <div>• シード値で決定的な生成が可能</div>
            <div>• メモリ管理のためfree()を忘れずに</div>
          </div>
        </div>
      </div>
    </section>
  )
}
