import { useState } from 'react'

// WASM implementation
import {
  IdType,
  Gnrng as WasmGnrng,
  createId as wasmCreateId,
  createIdBySeed as wasmCreateIdBySeed,
  getName as wasmGetName,
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
  wasmTime: number
  tsTime: number
  improvement: number
  iterations: number
  timestamp: Date
}

export function BenchmarkDemo() {
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [selectedTest, setSelectedTest] = useState<string>('gnrng')
  const [iterations, setIterations] = useState<string>('1000')

  const runBenchmark = async (
    name: string,
    wasmFn: () => void,
    tsFn: () => void,
    iterationCount: number
  ): Promise<BenchmarkResult> => {
    // Warm up
    for (let i = 0; i < 100; i++) {
      wasmFn()
      tsFn()
    }

    // Benchmark WASM
    const wasmStart = performance.now()
    for (let i = 0; i < iterationCount; i++) {
      wasmFn()
    }
    const wasmEnd = performance.now()
    const wasmTime = wasmEnd - wasmStart

    // Benchmark TypeScript
    const tsStart = performance.now()
    for (let i = 0; i < iterationCount; i++) {
      tsFn()
    }
    const tsEnd = performance.now()
    const tsTime = tsEnd - tsStart

    const improvement = tsTime / wasmTime

    return {
      name,
      wasmTime,
      tsTime,
      improvement,
      iterations: iterationCount,
      timestamp: new Date(),
    }
  }

  const handleRunBenchmark = async () => {
    if (isRunning) return

    setIsRunning(true)
    try {
      const iterationCount = Number.parseInt(iterations)
      if (
        Number.isNaN(iterationCount) ||
        iterationCount < 100 ||
        iterationCount > 100000
      ) {
        throw new Error('反復回数は100〜100000の範囲で指定してください')
      }

      let result: BenchmarkResult

      switch (selectedTest) {
        case 'gnrng':
          result = await runBenchmark(
            'GNRNG Random Generation',
            () => {
              const rng = new WasmGnrng('benchmark-seed')
              rng.next()
              rng.free()
            },
            () => {
              const rng = utilsGnrng('benchmark-seed')
              rng()
            },
            iterationCount
          )
          break

        case 'gnrng-sequence': {
          const rng = new WasmGnrng('benchmark-seed')
          const tsRng = utilsGnrng('benchmark-seed')

          result = await runBenchmark(
            'GNRNG Sequence Generation',
            () => {
              rng.next() // 1回だけ
            },
            () => {
              tsRng()
            },
            iterationCount // /10 しない。正味 iterationCount 回
          )

          rng.free() // 最後にfree()
          break
        }

        case 'create-id':
          result = await runBenchmark(
            'Random ID Creation',
            () => wasmCreateId(7, IdType.Default),
            () => utilsCreateId(7, 'default'),
            iterationCount
          )
          break

        case 'create-id-seeded':
          result = await runBenchmark(
            'Seeded ID Creation',
            () => wasmCreateIdBySeed('test-seed', 7, IdType.Default),
            () => utilsCreateIdBySeed('test-seed', 7, 'default'),
            iterationCount
          )
          break

        case 'get-name': {
          const existingNames = ['Panel', 'Panel (1)', 'Panel (2)', 'Panel (3)']
          result = await runBenchmark(
            'Unique Name Generation',
            () => wasmGetName('Panel', existingNames),
            () => utilsGetName('Panel', existingNames),
            iterationCount
          )
          break
        }

        case 'mixed-workload':
          result = await runBenchmark(
            'Mixed Workload',
            () => {
              const id1 = wasmCreateId(7, IdType.User)
              const _id2 = wasmCreateIdBySeed('test', 7, IdType.Project)
              const _name = wasmGetName('Item', ['Item', id1])
              const rng = new WasmGnrng('mixed')
              rng.next()
              rng.free()
            },
            () => {
              const id1 = utilsCreateId(7, 'user')
              const _id2 = utilsCreateIdBySeed('test', 7, 'project')
              const _name = utilsGetName('Item', ['Item', id1])
              const rng = utilsGnrng('mixed')
              rng()
            },
            Math.floor(iterationCount / 4)
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

  const runAllBenchmarks = async () => {
    if (isRunning) return

    setIsRunning(true)
    const allTests = [
      'gnrng',
      'gnrng-sequence',
      'create-id',
      'create-id-seeded',
      'get-name',
      'mixed-workload',
    ]

    try {
      for (const test of allTests) {
        setSelectedTest(test)
        await new Promise((resolve) => setTimeout(resolve, 100)) // UI update

        const iterationCount = Number.parseInt(iterations)
        let result: BenchmarkResult

        switch (test) {
          case 'gnrng':
            result = await runBenchmark(
              'GNRNG Random Generation',
              () => {
                const rng = new WasmGnrng('benchmark-seed')
                rng.next()
                rng.free()
              },
              () => {
                const rng = utilsGnrng('benchmark-seed')
                rng()
              },
              iterationCount
            )
            break

          case 'gnrng-sequence': {
            const rng = new WasmGnrng('benchmark-seed')
            const tsRng = utilsGnrng('benchmark-seed')

            result = await runBenchmark(
              'GNRNG Sequence Generation',
              () => {
                rng.next() // 1回だけ
              },
              () => {
                tsRng()
              },
              iterationCount // /10 しない。正味 iterationCount 回
            )

            rng.free() // 最後にfree()
            break
          }

          case 'create-id':
            result = await runBenchmark(
              'Random ID Creation',
              () => wasmCreateId(7, IdType.Default),
              () => utilsCreateId(7, 'default'),
              iterationCount
            )
            break

          case 'create-id-seeded':
            result = await runBenchmark(
              'Seeded ID Creation',
              () => wasmCreateIdBySeed('test-seed', 7, IdType.Default),
              () => utilsCreateIdBySeed('test-seed', 7, 'default'),
              iterationCount
            )
            break

          case 'get-name': {
            const existingNames = [
              'Panel',
              'Panel (1)',
              'Panel (2)',
              'Panel (3)',
            ]
            result = await runBenchmark(
              'Unique Name Generation',
              () => wasmGetName('Panel', existingNames),
              () => utilsGetName('Panel', existingNames),
              iterationCount
            )
            break
          }

          case 'mixed-workload':
            result = await runBenchmark(
              'Mixed Workload',
              () => {
                const id1 = wasmCreateId(7, IdType.User)
                const _id2 = wasmCreateIdBySeed('test', 7, IdType.Project)
                const _name = wasmGetName('Item', ['Item', id1])
                const rng = new WasmGnrng('mixed')
                rng.next()
                rng.free()
              },
              () => {
                const id1 = utilsCreateId(7, 'user')
                const _id2 = utilsCreateIdBySeed('test', 7, 'project')
                const _name = utilsGetName('Item', ['Item', id1])
                const rng = utilsGnrng('mixed')
                rng()
              },
              Math.floor(iterationCount / 4)
            )
            break
        }

        setResults((prev) => [result, ...prev.slice(0, 9)])
        await new Promise((resolve) => setTimeout(resolve, 500)) // Pause between tests
      }
    } finally {
      setIsRunning(false)
    }
  }

  const getImprovementColor = (improvement: number): string => {
    if (improvement >= 5) return 'text-green-600'
    if (improvement >= 3) return 'text-blue-600'
    if (improvement >= 2) return 'text-yellow-600'
    if (improvement >= 1) return 'text-gray-600'
    return 'text-red-600'
  }

  const getImprovementBadge = (improvement: number): string => {
    if (improvement >= 5) return '🚀'
    if (improvement >= 3) return '⚡'
    if (improvement >= 2) return '📈'
    if (improvement >= 1) return '✅'
    return '❌'
  }

  return (
    <section className="card">
      <h3 className="flex items-center section-title">
        <span className="mr-2">📊</span>
        Performance Benchmark (WASM vs TypeScript)
      </h3>

      <div className="space-y-6">
        {/* Test Configuration */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-3 font-semibold text-blue-900">ベンチマーク設定</h4>
          <div className="space-y-3">
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
                  <option value="gnrng">GNRNG Random Generation</option>
                  <option value="gnrng-sequence">GNRNG Sequence (10x)</option>
                  <option value="create-id">Random ID Creation</option>
                  <option value="create-id-seeded">Seeded ID Creation</option>
                  <option value="get-name">Unique Name Generation</option>
                  <option value="mixed-workload">Mixed Workload</option>
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
                  min="100"
                  max="100000"
                  disabled={isRunning}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRunBenchmark}
                disabled={isRunning}
                className="btn-primary disabled:opacity-50"
              >
                {isRunning ? '⏳ 実行中...' : '▶️ 単体実行'}
              </button>

              <button
                type="button"
                onClick={runAllBenchmarks}
                disabled={isRunning}
                className="btn-secondary disabled:opacity-50"
              >
                {isRunning ? '⏳ 実行中...' : '🚀 全テスト実行'}
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
                実行中: {selectedTest} ({iterations}回)
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h4 className="mb-4 font-semibold text-gray-700">
              📈 ベンチマーク結果
            </h4>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={`${result.name}-${result.timestamp.getTime()}`}
                  className="p-4 bg-white border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {getImprovementBadge(result.improvement)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {result.name}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({result.iterations.toLocaleString()} iterations)
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-3 border border-orange-200 rounded bg-orange-50">
                      <div className="text-xs tracking-wide text-orange-600 uppercase">
                        🦀 WASM (Rust)
                      </div>
                      <div className="text-lg font-bold text-orange-800">
                        {result.wasmTime.toFixed(2)}ms
                      </div>
                    </div>

                    <div className="p-3 border border-blue-200 rounded bg-blue-50">
                      <div className="text-xs tracking-wide text-blue-600 uppercase">
                        📝 TypeScript
                      </div>
                      <div className="text-lg font-bold text-blue-800">
                        {result.tsTime.toFixed(2)}ms
                      </div>
                    </div>

                    <div className="p-3 border border-green-200 rounded bg-green-50">
                      <div className="text-xs tracking-wide text-green-600 uppercase">
                        ⚡ 速度向上
                      </div>
                      <div
                        className={`text-lg font-bold ${getImprovementColor(result.improvement)}`}
                      >
                        {result.improvement.toFixed(1)}x faster
                      </div>
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        相対パフォーマンス
                      </span>
                      <span className="text-xs text-gray-600">
                        {(
                          ((result.tsTime - result.wasmTime) / result.tsTime) *
                          100
                        ).toFixed(1)}
                        % 改善
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-green-500"
                        style={{
                          width: `${Math.min((result.improvement / 10) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h5 className="mb-2 text-sm font-medium text-gray-900">
            ℹ️ ベンチマークについて
          </h5>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              • <strong>ウォームアップ:</strong>{' '}
              各テストは100回のウォームアップ後に測定
            </p>
            <p>
              • <strong>測定方法:</strong> performance.now() による高精度測定
            </p>
            <p>
              • <strong>WASM vs TypeScript:</strong>{' '}
              同一アルゴリズムの異なる実装を比較
            </p>
            <p>
              • <strong>結果の解釈:</strong> 数値が大きいほどWASM実装が高速
            </p>
            <p>
              • <strong>環境依存:</strong> 結果はブラウザとデバイスの性能に依存
            </p>
          </div>
        </div>

        {/* Average Performance Summary */}
        {results.length >= 3 && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <h5 className="mb-2 text-sm font-medium text-green-900">
              📊 平均パフォーマンス
            </h5>
            <div className="text-sm text-green-800">
              平均速度向上:{' '}
              <strong>
                {(
                  results.reduce((acc, r) => acc + r.improvement, 0) /
                  results.length
                ).toFixed(1)}
                x
              </strong>{' '}
              faster
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
