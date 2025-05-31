import { beforeAll, bench, describe } from 'vitest'
import {
  Gnrng,
  IdType,
  createDeterministicIdsBySeed,
  createId,
  createIdBySeed,
  createIds,
  createIdsBySeed,
  getName,
  getNames,
  gnrng,
  initWasm,
  smart,
} from './index'

// 既存実装との比較用
import {
  createId as utilsCreateId,
  createIdBySeed as utilsCreateIdBySeed,
  getName as utilsGetName,
  gnrng as utilsGnrng,
} from '@internal/utils'

describe('🚀 Performance Benchmarks: Optimized WASM vs TypeScript', () => {
  beforeAll(async () => {
    await initWasm()
  })

  describe('🎯 GNRNG Performance - Individual vs Batch', () => {
    bench('WASM: GNRNG individual calls (1000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('🚀 WASM: GNRNG batch call (1000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      rng.nextBatch(1000)
      rng.free()
    })

    bench('TypeScript: GNRNG individual calls (1000 values)', () => {
      const rng = utilsGnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        rng()
      }
    })

    bench('WASM: GNRNG individual calls (10000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      for (let i = 0; i < 10000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('🚀 WASM: GNRNG batch call (10000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      rng.nextBatch(10000)
      rng.free()
    })

    bench('TypeScript: GNRNG individual calls (10000 values)', () => {
      const rng = utilsGnrng('benchmark-seed')
      for (let i = 0; i < 10000; i++) {
        rng()
      }
    })
  })

  describe('🎯 GNRNG Range Performance - Individual vs Batch', () => {
    bench('WASM: GNRNG range individual calls (1000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        rng.nextRange(1, 100)
      }
      rng.free()
    })

    bench('🚀 WASM: GNRNG range batch call (1000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      rng.nextRangeBatch(1, 100, 1000)
      rng.free()
    })

    bench('TypeScript: GNRNG range individual calls (1000 values)', () => {
      const rng = utilsGnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        const value = rng()
        Math.floor(value * 99) + 1 // 1-100の範囲に変換
      }
    })

    bench('🚀 WASM: GNRNG range batch call (5000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      rng.nextRangeBatch(1, 100, 5000)
      rng.free()
    })
  })

  describe('🎯 Random ID Generation - Individual vs Batch', () => {
    bench('WASM: createId() individual calls (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        createId(7, IdType.Default)
      }
    })

    bench('🚀 WASM: createIds() batch call (1000 times)', () => {
      createIds(1000, 7, IdType.Default)
    })

    bench('TypeScript: createId() individual calls (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateId(7, 'default')
      }
    })

    bench('WASM: createId() various sizes individual (1000 times)', () => {
      const sizes = [5, 7, 10, 12, 15]
      for (let i = 0; i < 1000; i++) {
        const size = sizes[i % sizes.length]
        createId(size, IdType.Default)
      }
    })

    bench('🚀 WASM: createIds() large batch (5000 times)', () => {
      createIds(5000, 7, IdType.Default)
    })

    bench('TypeScript: createId() large individual (5000 times)', () => {
      for (let i = 0; i < 5000; i++) {
        utilsCreateId(7, 'default')
      }
    })
  })

  describe('🎯 Seeded ID Generation - Individual vs Batch', () => {
    bench('WASM: createIdBySeed() individual calls (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        createIdBySeed(`seed-${i}`, 7, IdType.Default)
      }
    })

    bench('🚀 WASM: createIdsBySeed() batch call (1000 times)', () => {
      createIdsBySeed('batch-seed', 1000, 7, IdType.Default)
    })

    bench('TypeScript: createIdBySeed() individual calls (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateIdBySeed(`seed-${i}`, 7, 'default')
      }
    })

    bench('WASM: createIdBySeed() same seed individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        createIdBySeed('benchmark-seed', 7, IdType.Default)
      }
    })

    bench('🚀 WASM: createDeterministicIdsBySeed() batch call (1000 times)', () => {
      createDeterministicIdsBySeed('benchmark-seed', 1000, 7, IdType.Default)
    })

    bench('TypeScript: createIdBySeed() same seed individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateIdBySeed('benchmark-seed', 7, 'default')
      }
    })
  })

  describe('🎯 Name Generation - Individual vs Batch', () => {
    const existingNames = Array.from({ length: 100 }, (_, i) => `Item ${i}`)

    bench('WASM: getName() individual no conflicts (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        getName(`NewItem${i}`, existingNames)
      }
    })

    bench('🚀 WASM: getNames() batch no conflicts (1000 times)', () => {
      const baseNames = Array.from({ length: 1000 }, (_, i) => `NewItem${i}`)
      getNames(baseNames, existingNames)
    })

    bench('TypeScript: getName() individual no conflicts (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        utilsGetName(`NewItem${i}`, existingNames)
      }
    })

    const conflictingNames = Array.from({ length: 50 }, (_, i) =>
      i === 0 ? 'Panel' : `Panel (${i})`
    )

    bench('WASM: getName() individual with conflicts (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        getName('Panel', conflictingNames)
      }
    })

    bench('🚀 WASM: getNames() batch with conflicts (1000 times)', () => {
      const baseNames = Array.from({ length: 1000 }, () => 'Panel')
      getNames(baseNames, conflictingNames)
    })

    bench('TypeScript: getName() individual with conflicts (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        utilsGetName('Panel', conflictingNames)
      }
    })
  })

  describe('🎯 Mixed Workload - Individual vs Batch', () => {
    bench('WASM: Mixed operations individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        // ID生成
        const randomId = createId(7, IdType.User)
        const _seededId = createIdBySeed(`seed-${i}`, 7, IdType.Project)

        // 名前生成
        const _uniqueName = getName('Item', ['Item', 'Item (1)', randomId])

        // 乱数生成
        const rng = gnrng(`mixed-${i}`)
        rng.next()
        rng.nextRange(1, 100)
        rng.free()
      }
    })

    bench('🚀 WASM: Mixed operations batch (1000 times)', () => {
      // バッチID生成
      const _randomIds = createIds(1000, 7, IdType.User)
      const _seededIds = createIdsBySeed('batch-seed', 1000, 7, IdType.Project)

      // バッチ名前生成
      const baseNames = Array.from({ length: 1000 }, () => 'Item')
      const existingNames = ['Item', 'Item (1)']
      const _uniqueNames = getNames(baseNames, existingNames)

      // バッチ乱数生成
      const rng = gnrng('mixed-batch')
      rng.nextBatch(1000)
      rng.nextRangeBatch(1, 100, 1000)
      rng.free()
    })

    bench('TypeScript: Mixed operations individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        // ID生成
        const randomId = utilsCreateId(7, 'user')
        const _seededId = utilsCreateIdBySeed(`seed-${i}`, 7, 'project')

        // 名前生成
        const _uniqueName = utilsGetName('Item', ['Item', 'Item (1)', randomId])

        // 乱数生成
        const rng = utilsGnrng(`mixed-${i}`)
        rng()
        const value = rng()
        Math.floor(value * 99) + 1 // 1-100の範囲
      }
    })
  })

  describe('🎯 Extreme Performance Tests', () => {
    bench('🚀 WASM: Ultra-large batch GNRNG (100K values)', () => {
      const rng = new Gnrng('ultra-seed')
      rng.nextBatch(100000)
      rng.free()
    })

    bench('WASM: Ultra-large individual GNRNG (100K values)', () => {
      const rng = new Gnrng('ultra-seed')
      for (let i = 0; i < 100000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('🚀 WASM: Ultra-large batch ID generation (10K IDs)', () => {
      createIds(10000, 10, IdType.Default)
    })

    bench('WASM: Ultra-large individual ID generation (10K IDs)', () => {
      for (let i = 0; i < 10000; i++) {
        createId(10, IdType.Default)
      }
    })

    bench('🚀 WASM: Ultra-large deterministic batch (10K IDs)', () => {
      createDeterministicIdsBySeed('ultra-seed', 10000, 10, IdType.Default)
    })

    bench('WASM: Ultra-large deterministic individual (10K IDs)', () => {
      for (let i = 0; i < 10000; i++) {
        createIdBySeed('ultra-seed', 10, IdType.Default)
      }
    })

    bench('TypeScript: Ultra-large individual GNRNG (100K values)', () => {
      const rng = utilsGnrng('ultra-seed')
      for (let i = 0; i < 100000; i++) {
        rng()
      }
    })

    bench('TypeScript: Ultra-large individual ID generation (10K IDs)', () => {
      for (let i = 0; i < 10000; i++) {
        utilsCreateId(10, 'default')
      }
    })
  })

  describe('🎯 Batch Size Optimization Analysis', () => {
    const batchSizes = [10, 50, 100, 500, 1000, 5000]

    for (const size of batchSizes) {
      bench(`🚀 WASM: GNRNG batch size ${size}`, () => {
        const rng = new Gnrng('batch-analysis')
        rng.nextBatch(size)
        rng.free()
      })

      bench(`WASM: GNRNG individual ${size} calls`, () => {
        const rng = new Gnrng('batch-analysis')
        for (let i = 0; i < size; i++) {
          rng.next()
        }
        rng.free()
      })
    }
  })

  describe('🎯 Memory Efficiency Tests', () => {
    bench('🚀 WASM: Memory efficient large batch (50K)', () => {
      const rng = new Gnrng('memory-test')
      // 分割バッチ処理の効果をテスト
      rng.nextBatch(50000)
      rng.free()
    })

    bench('🚀 WASM: Chunked ID generation (50K)', () => {
      // 内部的に分割処理される
      createIds(50000, 7, IdType.Default)
    })

    bench('WASM: Individual memory pressure (50K)', () => {
      const rng = new Gnrng('memory-test')
      const results: number[] = []
      for (let i = 0; i < 50000; i++) {
        results.push(rng.next())
      }
      rng.free()
    })
  })

  describe('🎯 Smart API Performance', () => {
    bench('🚀 Smart: SmartGnrng optimized usage', async () => {
      const smartRng = new smart.SmartGnrng('smart-seed')

      // スマートバッチ処理
      const promises: Promise<number>[] = []
      for (let i = 0; i < 100; i++) {
        promises.push(smartRng.next())
      }

      await Promise.all(promises)
      smartRng.free()
    })

    bench('🚀 Smart: Auto-optimized ID generation', () => {
      // 自動的に最適なAPIを選択
      smart.createIds(500, 7, IdType.Default)
    })
  })

  describe('🎯 Edge Case Performance', () => {
    bench('WASM: Very small batches (size=1)', () => {
      for (let i = 0; i < 1000; i++) {
        const rng = new Gnrng(`small-${i}`)
        rng.nextBatch(1)
        rng.free()
      }
    })

    bench('🚀 WASM: Optimal small batches (size=10)', () => {
      for (let i = 0; i < 100; i++) {
        const rng = new Gnrng(`optimal-${i}`)
        rng.nextBatch(10)
        rng.free()
      }
    })

    bench('WASM: Long seed strings batch', () => {
      const longSeed = 'a'.repeat(1000)
      const rng = new Gnrng(longSeed)
      rng.nextBatch(1000)
      rng.free()
    })

    bench('TypeScript: Long seed strings individual', () => {
      const longSeed = 'a'.repeat(1000)
      const rng = utilsGnrng(longSeed)
      for (let i = 0; i < 1000; i++) {
        rng()
      }
    })

    bench('🚀 WASM: Large ID sizes batch (size=100)', () => {
      createIds(100, 100, IdType.Default)
    })

    bench('WASM: Large ID sizes individual (size=100)', () => {
      for (let i = 0; i < 100; i++) {
        createId(100, IdType.Default)
      }
    })
  })

  describe('🎯 Real-world Usage Patterns', () => {
    bench('🚀 Realistic: User session IDs (1000 users)', () => {
      createIds(1000, 8, IdType.User)
    })

    bench('🚀 Realistic: Project initialization (100 projects, 10 IDs each)', () => {
      for (let i = 0; i < 100; i++) {
        createDeterministicIdsBySeed(`project-${i}`, 10, 8, IdType.Project)
      }
    })

    bench('🚀 Realistic: Game random events (10K events)', () => {
      const rng = new Gnrng('game-session')
      rng.nextRangeBatch(1, 6, 10000) // dice rolls
      rng.free()
    })

    bench('🚀 Realistic: UI element naming (500 components)', () => {
      const baseNames = Array.from({ length: 500 }, (_, i) => `Component${i % 10}`)
      const existing = ['Component0', 'Component1', 'Component1 (1)']
      getNames(baseNames, existing)
    })

    bench('Realistic: Traditional individual calls equivalent', () => {
      // ユーザーセッションID
      for (let i = 0; i < 1000; i++) {
        createId(8, IdType.User)
      }

      // プロジェクト初期化
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 10; j++) {
          createIdBySeed(`project-${i}-${j}`, 8, IdType.Project)
        }
      }

      // ゲーム乱数イベント
      const rng = new Gnrng('game-session')
      for (let i = 0; i < 10000; i++) {
        rng.nextRange(1, 6)
      }
      rng.free()

      // UI要素命名
      const existing = ['Component0', 'Component1', 'Component1 (1)']
      for (let i = 0; i < 500; i++) {
        getName(`Component${i % 10}`, existing)
      }
    })
  })

  describe('🎯 Performance Baseline', () => {
    bench('Baseline: Native Math.random() (10K calls)', () => {
      for (let i = 0; i < 10000; i++) {
        Math.random()
      }
    })

    bench('Baseline: Array creation overhead (10K elements)', () => {
      const arr = new Array(10000)
      for (let i = 0; i < 10000; i++) {
        arr[i] = Math.random()
      }
    })

    bench('Baseline: String concatenation (1K operations)', () => {
      for (let i = 0; i < 1000; i++) {
        const _result = `prefix_${Math.random().toString(36).substr(2, 7)}`
      }
    })

    bench('🚀 WASM: Optimized equivalent baseline', () => {
      // 最適化されたWASM実装の基準測定
      const rng = new Gnrng('baseline')
      rng.nextBatch(10000)
      rng.free()
    })
  })
})

// ベンチマーク結果の分析用ヘルパー
describe('📊 Benchmark Analysis', () => {
  bench('Analysis: FFI overhead measurement', () => {
    // FFI境界通過のオーバーヘッドを測定
    for (let i = 0; i < 1000; i++) {
      const rng = new Gnrng('overhead-test')
      rng.free() // 作成→即削除でFFIオーバーヘッドを測定
    }
  })

  bench('🚀 Analysis: Batch efficiency demonstration', () => {
    // バッチ処理の効率性を実証
    const rng = new Gnrng('efficiency-test')

    // 複数のバッチサイズで効率性をテスト
    rng.nextBatch(100)
    rng.nextBatch(500)
    rng.nextBatch(1000)

    rng.free()
  })

  bench('Analysis: Memory allocation pattern', () => {
    // メモリ割り当てパターンの測定
    const results: string[] = []
    for (let i = 0; i < 1000; i++) {
      results.push(createId(7, IdType.Default))
    }
  })

  bench('🚀 Analysis: Optimized memory pattern', () => {
    // 最適化されたメモリパターン
    const _results = createIds(1000, 7, IdType.Default)
  })
})
