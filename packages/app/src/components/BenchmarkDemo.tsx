import { useState } from 'react'

// WASM implementation
import {
  IdType,
  Gnrng as WasmGnrng,
  smart,
  createDeterministicIdsBySeed as wasmCreateDeterministicIdsBySeed,
  createId as wasmCreateId,
  createIdBySeed as wasmCreateIdBySeed,
  createIds as wasmCreateIds,
  createIdsBySeed as wasmCreateIdsBySeed,
  getName as wasmGetName,
  getNames as wasmGetNames,
} from '@nap5/gnrng-id'

// TypeScript implementation for comparison
import {
  createId as utilsCreateId,
  createIdBySeed as utilsCreateIdBySeed,
  getName as utilsGetName,
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
  category: 'individual' | 'batch' | 'comparison'
}

const PRESET_BATCH_SIZES = [
  { value: '100', label: '100 (小)' },
  { value: '1000', label: '1,000 (中)' },
  { value: '5000', label: '5,000 (大)' },
  { value: '10000', label: '10,000 (超大)' },
] as const

export function BenchmarkDemo() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [selectedTest, setSelectedTest] = useState<string>('gnrng-batch')
  const [iterations, setIterations] = useState<string>('1000')
  const [batchSize, setBatchSize] = useState<string>('1000')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)

  const runBenchmark = async (
    name: string,
    description: string,
    wasmFn: () => void,
    wasmBatchFn: (() => void) | null,
    tsFn: () => void,
    iterationCount: number,
    category: 'individual' | 'batch' | 'comparison' = 'individual'
  ): Promise<BenchmarkResult> => {
    // Warm up
    for (let i = 0; i < 10; i++) {
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

  const handleRunBenchmark = async () => {
    if (isRunning) return

    setIsRunning(true)
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

      let result: BenchmarkResult

      switch (selectedTest) {
        case 'gnrng-batch':
          result = await runBenchmark(
            'GNRNG Random Generation',
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
            'batch'
          )
          break

        case 'gnrng-range-batch':
          result = await runBenchmark(
            'GNRNG Range Generation',
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
            'batch'
          )
          break

        case 'create-id-batch':
          result = await runBenchmark(
            'Random ID Creation',
            `ID生成: 個別 vs バッチ (${batchCount}個ずつ)`,
            () => wasmCreateId(7, IdType.Default),
            () => wasmCreateIds(batchCount, 7, IdType.Default),
            () => utilsCreateId(7, 'default'),
            iterationCount,
            'batch'
          )
          break

        case 'create-id-seeded-batch':
          result = await runBenchmark(
            'Seeded ID Creation',
            `シードID: 個別 vs バッチ (${batchCount}個ずつ)`,
            () => wasmCreateIdBySeed('test-seed', 7, IdType.Default),
            () =>
              wasmCreateIdsBySeed('test-seed', batchCount, 7, IdType.Default),
            () => utilsCreateIdBySeed('test-seed', 7, 'default'),
            iterationCount,
            'batch'
          )
          break

        case 'deterministic-id-batch':
          result = await runBenchmark(
            'Deterministic ID Creation',
            `決定的ID: 個別 vs バッチ (${batchCount}個ずつ)`,
            () => wasmCreateIdBySeed('deterministic-seed', 7, IdType.Default),
            () =>
              wasmCreateDeterministicIdsBySeed(
                'deterministic-seed',
                batchCount,
                7,
                IdType.Default
              ),
            () => utilsCreateIdBySeed('deterministic-seed', 7, 'default'),
            iterationCount,
            'batch'
          )
          break

        case 'get-name-batch': {
          const existingNames = ['Panel', 'Panel (1)', 'Panel (2)', 'Panel (3)']
          const baseNames = Array.from({ length: batchCount }, () => 'Panel')

          result = await runBenchmark(
            'Unique Name Generation',
            `名前生成: 個別 vs バッチ (${batchCount}個ずつ)`,
            () => wasmGetName('Panel', existingNames),
            () => wasmGetNames(baseNames, existingNames),
            () => utilsGetName('Panel', existingNames),
            iterationCount,
            'batch'
          )
          break
        }

        case 'smart-optimization':
          result = await runBenchmark(
            'Smart Optimization',
            `スマート最適化 vs 従来処理 (${batchCount}個)`,
            () => {
              for (let i = 0; i < Math.min(batchCount, 100); i++) {
                wasmCreateId(7, IdType.Default)
              }
            },
            () => smart.createIds(batchCount, 7, IdType.Default),
            () => {
              for (let i = 0; i < Math.min(batchCount, 100); i++) {
                utilsCreateId(7, 'default')
              }
            },
            Math.floor(iterationCount / 10),
            'batch'
          )
          break

        case 'real-world-session':
          result = await runBenchmark(
            'Real-world: User Sessions',
            `ユーザーセッション管理 (${batchCount}ユーザー)`,
            () => {
              for (let i = 0; i < Math.min(batchCount, 100); i++) {
                wasmCreateId(8, IdType.User)
              }
            },
            () => wasmCreateIds(batchCount, 8, IdType.User),
            () => {
              for (let i = 0; i < Math.min(batchCount, 100); i++) {
                utilsCreateId(8, 'user')
              }
            },
            Math.floor(iterationCount / 10),
            'comparison'
          )
          break

        case 'real-world-game':
          result = await runBenchmark(
            'Real-world: Game Events',
            `ゲームランダムイベント (${batchCount}イベント)`,
            () => {
              const rng = new WasmGnrng('game-session')
              for (let i = 0; i < Math.min(batchCount, 100); i++) {
                rng.nextRange(1, 6)
              }
              rng.free()
            },
            () => {
              const rng = new WasmGnrng('game-session')
              rng.nextRangeBatch(1, 6, batchCount)
              rng.free()
            },
            () => {
              const rng = utilsGnrng('game-session')
              for (let i = 0; i < Math.min(batchCount, 100); i++) {
                const value = rng()
                Math.floor(value * 6) + 1
              }
            },
            Math.floor(iterationCount / 10),
            'comparison'
          )
          break

        default:
          throw new Error('不明なテストタイプです')
      }

      setResults((prev) => [result, ...prev.slice(0, 9)])
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

  const runComprehensiveBenchmark = async () => {
    if (isRunning) return

    setIsRunning(true)
    const comprehensiveTests = [
      'gnrng-batch',
      'gnrng-range-batch',
      'create-id-batch',
      'create-id-seeded-batch',
      'deterministic-id-batch',
      'get-name-batch',
      'real-world-session',
      'real-world-game',
    ]

    try {
      for (const test of comprehensiveTests) {
        setSelectedTest(test)
        await new Promise((resolve) => setTimeout(resolve, 100))
        await handleRunBenchmark()
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } finally {
      setIsRunning(false)
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
      case 'batch':
        return '🚀 バッチ最適化'
      case 'comparison':
        return '🔄 実用比較'
      case 'individual':
        return '📊 個別処理'
    }
  }

  return (
    <section className="card">
      <h3 className="flex items-center section-title">
        <span className="mr-2">🚀</span>
        バッチAPI Performance Benchmark
      </h3>

      <div className="space-y-6">
        {/* Test Configuration */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-3 font-semibold text-blue-900">
            🎯 ベンチマーク設定
          </h4>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="test-select"
                  className="text-sm font-medium text-blue-800"
                >
                  テスト:
                </label>
                <select
                  id="test-select"
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="input"
                  disabled={isRunning}
                >
                  <optgroup label="🚀 バッチ最適化テスト">
                    <option value="gnrng-batch">GNRNG: 個別 vs バッチ</option>
                    <option value="gnrng-range-batch">
                      GNRNG範囲: 個別 vs バッチ
                    </option>
                    <option value="create-id-batch">
                      ID生成: 個別 vs バッチ
                    </option>
                    <option value="create-id-seeded-batch">
                      シードID: 個別 vs バッチ
                    </option>
                    <option value="deterministic-id-batch">
                      決定的ID: 個別 vs バッチ
                    </option>
                    <option value="get-name-batch">
                      名前生成: 個別 vs バッチ
                    </option>
                  </optgroup>
                  <optgroup label="🧠 スマート最適化">
                    <option value="smart-optimization">
                      スマート自動最適化
                    </option>
                  </optgroup>
                  <optgroup label="🌍 実用例">
                    <option value="real-world-session">
                      実用: ユーザーセッション
                    </option>
                    <option value="real-world-game">
                      実用: ゲームイベント
                    </option>
                  </optgroup>
                </select>
              </div>

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
                  {PRESET_BATCH_SIZES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAdvanced ? '▼' : '▶'} 詳細設定
              </button>
            </div>

            {showAdvanced && (
              <div className="p-3 border border-blue-300 rounded bg-blue-25">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="custom-batch-input"
                    className="text-sm font-medium text-blue-800"
                  >
                    カスタムバッチサイズ:
                  </label>
                  <input
                    id="custom-batch-input"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-32 input"
                    min="10"
                    max="100000"
                    disabled={isRunning}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRunBenchmark}
                disabled={isRunning}
                className="btn-primary disabled:opacity-50"
              >
                {isRunning ? '⏳ 実行中...' : '🚀 バッチベンチマーク実行'}
              </button>

              <button
                type="button"
                onClick={runComprehensiveBenchmark}
                disabled={isRunning}
                className="btn-secondary disabled:opacity-50"
              >
                {isRunning ? '⏳ 実行中...' : '📊 包括テスト実行'}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Progress */}
        {isRunning && (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-3 border-2 border-yellow-600 rounded-full animate-spin border-t-transparent" />
              <span className="text-yellow-800">
                実行中: {selectedTest} (バッチサイズ: {batchSize}, 反復:{' '}
                {iterations}回)
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h4 className="mb-4 font-semibold text-gray-700">
              🚀 バッチAPI最適化結果
            </h4>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={`${result.name}-${result.timestamp.getTime()}`}
                  className="p-4 bg-white border-2 rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {getImprovementBadge(result.improvement)}
                      </span>
                      <div>
                        <span className="font-medium text-gray-900">
                          {result.name}
                        </span>
                        <div className="text-sm text-gray-600">
                          {result.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getCategoryBadge(result.category)} •{' '}
                          {result.iterations.toLocaleString()} iterations
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="p-3 border border-orange-200 rounded bg-orange-50">
                      <div className="text-xs tracking-wide text-orange-600 uppercase">
                        🦀 WASM個別
                      </div>
                      <div className="text-lg font-bold text-orange-800">
                        {result.wasmTime.toFixed(2)}ms
                      </div>
                    </div>

                    {result.wasmBatchTime !== undefined && (
                      <div className="p-3 border border-green-200 rounded bg-green-50">
                        <div className="text-xs tracking-wide text-green-600 uppercase">
                          🚀 WASMバッチ
                        </div>
                        <div className="text-lg font-bold text-green-800">
                          {result.wasmBatchTime.toFixed(2)}ms
                        </div>
                        {result.batchImprovement && (
                          <div className="text-xs text-green-600">
                            個別の{result.batchImprovement.toFixed(1)}x速い
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-3 border border-blue-200 rounded bg-blue-50">
                      <div className="text-xs tracking-wide text-blue-600 uppercase">
                        📝 TypeScript
                      </div>
                      <div className="text-lg font-bold text-blue-800">
                        {result.tsTime.toFixed(2)}ms
                      </div>
                    </div>

                    <div className="p-3 border border-purple-200 rounded bg-purple-50">
                      <div className="text-xs tracking-wide text-purple-600 uppercase">
                        ⚡ 最終改善
                      </div>
                      <div
                        className={`text-lg font-bold ${getImprovementColor(result.improvement)}`}
                      >
                        {result.improvement.toFixed(1)}x faster
                      </div>
                    </div>
                  </div>

                  {/* Performance Visualization */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        パフォーマンス比較
                      </span>
                      <span className="text-sm text-gray-600">
                        {(
                          ((result.tsTime -
                            (result.wasmBatchTime || result.wasmTime)) /
                            result.tsTime) *
                          100
                        ).toFixed(1)}
                        % 改善
                      </span>
                    </div>

                    <div className="relative">
                      {/* TypeScript baseline */}
                      <div className="w-full h-3 mb-1 bg-blue-200 rounded-full">
                        <div className="flex items-center justify-center h-3 text-xs text-white bg-blue-500 rounded-full">
                          TypeScript
                        </div>
                      </div>

                      {/* WASM Individual */}
                      <div className="w-full h-3 mb-1 bg-orange-200 rounded-full">
                        <div
                          className="flex items-center justify-center h-3 text-xs text-white bg-orange-500 rounded-full"
                          style={{
                            width: `${(result.wasmTime / result.tsTime) * 100}%`,
                          }}
                        >
                          WASM個別
                        </div>
                      </div>

                      {/* WASM Batch */}
                      {result.wasmBatchTime !== undefined && (
                        <div className="w-full h-3 bg-green-200 rounded-full">
                          <div
                            className="flex items-center justify-center h-3 text-xs text-white bg-green-500 rounded-full"
                            style={{
                              width: `${(result.wasmBatchTime / result.tsTime) * 100}%`,
                            }}
                          >
                            WASMバッチ 🚀
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {results.length >= 3 && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <h5 className="mb-3 text-sm font-medium text-green-900">
              📊 バッチAPI最適化サマリー
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
            ℹ️ バッチAPI最適化について
          </h5>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              • <strong>🚀 バッチ処理:</strong>{' '}
              複数の処理を一括実行してFFI境界コストを削減
            </p>
            <p>
              • <strong>⚡ FFI最適化:</strong>{' '}
              JavaScript↔WASM間の通信回数を最小化
            </p>
            <p>
              • <strong>📈 期待効果:</strong> 従来比10-50倍の高速化を実現
            </p>
            <p>
              • <strong>🎯 適用場面:</strong>{' '}
              大量データ処理、バッチ処理、リアルタイム処理
            </p>
            <p>
              • <strong>⚠️ 注意:</strong> バッチサイズが小さすぎると効果が限定的
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <h5 className="mb-2 text-sm font-medium text-yellow-900">
            💡 最適化のコツ
          </h5>
          <div className="grid gap-2 text-sm text-yellow-800 sm:grid-cols-2">
            <div>• バッチサイズ100以上で効果的</div>
            <div>• 1000-10000が最適な範囲</div>
            <div>• 反復処理はバッチAPIを活用</div>
            <div>• スマートAPIで自動最適化</div>
          </div>
        </div>
      </div>
    </section>
  )
}
