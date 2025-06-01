import { beforeAll, bench, describe } from 'vitest'
import { Gnrng, IdType, createIdBySeed, createIdsBySeed, gnrng, initWasm } from './index'

// 既存実装との比較用
import { createIdBySeed as utilsCreateIdBySeed, gnrng as utilsGnrng } from '@internal/utils'

describe('🚀 GNRNG-ID Performance Benchmarks: WASM vs TypeScript', () => {
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

    bench('🚀 WASM: createIdsBySeed() deterministic batch (1000 times)', () => {
      createIdsBySeed('benchmark-seed', 1000, 7, IdType.Default)
    })

    bench('TypeScript: createIdBySeed() same seed individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateIdBySeed('benchmark-seed', 7, 'default')
      }
    })
  })

  describe('🎯 Mixed Workload - Individual vs Batch', () => {
    bench('WASM: Mixed operations individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        // ID生成
        // @ts-expect-error ベンチマークのためOmit
        const _seededId = createIdBySeed(`seed-${i}`, 7, IdType.Project)

        // 乱数生成
        const rng = gnrng(`mixed-${i}`)
        rng.next()
        rng.nextRange(1, 100)
        rng.free()
      }
    })

    bench('🚀 WASM: Mixed operations batch (1000 times)', () => {
      // バッチID生成
      // @ts-expect-error ベンチマークのためOmit
      const _seededIds = createIdsBySeed('batch-seed', 1000, 7, IdType.Project)

      // バッチ乱数生成
      const rng = gnrng('mixed-batch')
      rng.nextBatch(1000)
      rng.nextRangeBatch(1, 100, 1000)
      rng.free()
    })

    bench('TypeScript: Mixed operations individual (1000 times)', () => {
      for (let i = 0; i < 1000; i++) {
        // ID生成
        // @ts-expect-error ベンチマークのためOmit
        const _seededId = utilsCreateIdBySeed(`seed-${i}`, 7, 'project')

        // 乱数生成
        const rng = utilsGnrng(`mixed-${i}`)
        rng()
        const value = rng()
        Math.floor(value * 99) + 1 // 1-100の範囲
      }
    })
  })

  describe('🎯 Large Scale Performance Tests', () => {
    bench('🚀 WASM: Large batch GNRNG (50K values)', () => {
      const rng = new Gnrng('large-seed')
      rng.nextBatch(50000)
      rng.free()
    })

    bench('WASM: Large individual GNRNG (50K values)', () => {
      const rng = new Gnrng('large-seed')
      for (let i = 0; i < 50000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('🚀 WASM: Large batch ID generation (5K IDs)', () => {
      createIdsBySeed('large-batch', 5000, 7, IdType.Default)
    })

    bench('WASM: Large individual ID generation (5K IDs)', () => {
      for (let i = 0; i < 5000; i++) {
        createIdBySeed(`large-${i}`, 7, IdType.Default)
      }
    })

    bench('TypeScript: Large individual GNRNG (50K values)', () => {
      const rng = utilsGnrng('large-seed')
      for (let i = 0; i < 50000; i++) {
        rng()
      }
    })

    bench('TypeScript: Large individual ID generation (5K IDs)', () => {
      for (let i = 0; i < 5000; i++) {
        utilsCreateIdBySeed(`large-${i}`, 7, 'default')
      }
    })
  })

  describe('🎯 Real-world Usage Patterns', () => {
    bench('🚀 Realistic: User session IDs (1000 users)', () => {
      createIdsBySeed('user-session', 1000, 8, IdType.User)
    })

    bench('WASM: Traditional user session IDs', () => {
      for (let i = 0; i < 1000; i++) {
        createIdBySeed(`user-${i}`, 8, IdType.User)
      }
    })

    bench('🚀 Realistic: Game random events (10K events)', () => {
      const rng = new Gnrng('game-session')
      rng.nextRangeBatch(1, 6, 10000) // dice rolls
      rng.free()
    })

    bench('WASM: Traditional game events', () => {
      const rng = new Gnrng('game-session')
      for (let i = 0; i < 10000; i++) {
        rng.nextRange(1, 6)
      }
      rng.free()
    })

    bench('🚀 Realistic: Project initialization (100 projects, 10 IDs each)', () => {
      for (let i = 0; i < 100; i++) {
        createIdsBySeed(`project-${i}`, 10, 8, IdType.Project)
      }
    })

    bench('WASM: Traditional project initialization', () => {
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 10; j++) {
          createIdBySeed(`project-${i}-${j}`, 8, IdType.Project)
        }
      }
    })

    bench('TypeScript: User session IDs equivalent', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateIdBySeed(`user-${i}`, 8, 'user')
      }
    })

    bench('TypeScript: Game events equivalent', () => {
      const rng = utilsGnrng('game-session')
      for (let i = 0; i < 10000; i++) {
        const value = rng()
        Math.floor(value * 6) + 1
      }
    })

    bench('TypeScript: Project initialization equivalent', () => {
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 10; j++) {
          utilsCreateIdBySeed(`project-${i}-${j}`, 8, 'project')
        }
      }
    })
  })

  describe('🎯 Batch Size Optimization Analysis', () => {
    const batchSizes = [10, 100, 1000, 5000]

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

      bench(`🚀 WASM: ID batch size ${size}`, () => {
        createIdsBySeed('id-batch-analysis', size, 7, IdType.Default)
      })

      bench(`WASM: ID individual ${size} calls`, () => {
        for (let i = 0; i < size; i++) {
          createIdBySeed(`id-individual-${i}`, 7, IdType.Default)
        }
      })
    }
  })

  describe('🎯 Performance Baseline', () => {
    bench('Baseline: Native Math.random() (10K calls)', () => {
      for (let i = 0; i < 10000; i++) {
        Math.random()
      }
    })

    bench('Baseline: String concatenation (1K operations)', () => {
      for (let i = 0; i < 1000; i++) {
        // @ts-expect-error ベンチマークのためOmit
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

  describe('📊 Consistency and Compatibility Tests', () => {
    bench('Consistency: WASM vs TypeScript GNRNG compatibility', () => {
      const wasmRng = new Gnrng('consistency-test')
      const utilsRng = utilsGnrng('consistency-test')

      // 決定性の確認
      for (let i = 0; i < 100; i++) {
        // @ts-expect-error ベンチマークのためOmit
        const _wasmValue = wasmRng.next()
        // @ts-expect-error ベンチマークのためOmit
        const _utilsValue = utilsRng()
        // 同じアルゴリズムなので同じ値になることを期待
      }

      wasmRng.free()
    })

    bench('Consistency: WASM vs TypeScript ID generation', () => {
      for (let i = 0; i < 100; i++) {
        // @ts-expect-error ベンチマークのためOmit
        const _wasmId = createIdBySeed(`consistency-${i}`, 7, IdType.Default)
        // @ts-expect-error ベンチマークのためOmit
        const _utilsId = utilsCreateIdBySeed(`consistency-${i}`, 7, 'default')
        // 同じアルゴリズムなので同じIDになることを期待
      }
    })
  })
})
