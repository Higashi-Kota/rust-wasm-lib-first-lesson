import { beforeAll, bench, describe } from 'vitest'
import {
  Gnrng,
  IdType,
  createId,
  createIdBySeed,
  getName,
  gnrng,
  initWasm,
} from './index'

// 既存実装との比較用
import {
  createId as utilsCreateId,
  createIdBySeed as utilsCreateIdBySeed,
  getName as utilsGetName,
  gnrng as utilsGnrng,
} from '@internal/utils'

describe('Performance Benchmarks: WASM vs TypeScript', () => {
  beforeAll(async () => {
    await initWasm()
  })

  describe('GNRNG Performance', () => {
    bench('WASM: GNRNG random generation (1000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('TypeScript: GNRNG random generation (1000 values)', () => {
      const rng = utilsGnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        rng()
      }
    })

    bench('WASM: GNRNG random generation (10000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      for (let i = 0; i < 10000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('TypeScript: GNRNG random generation (10000 values)', () => {
      const rng = utilsGnrng('benchmark-seed')
      for (let i = 0; i < 10000; i++) {
        rng()
      }
    })
  })

  describe('GNRNG Range Generation Performance', () => {
    bench('WASM: GNRNG range generation (1000 values)', () => {
      const rng = new Gnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        rng.nextRange(1, 100)
      }
      rng.free()
    })

    bench('TypeScript: GNRNG range generation (1000 values)', () => {
      const rng = utilsGnrng('benchmark-seed')
      for (let i = 0; i < 1000; i++) {
        const value = rng()
        Math.floor(value * 99) + 1 // 1-100の範囲に変換
      }
    })
  })

  describe('Random ID Generation Performance', () => {
    bench('WASM: createId() 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        createId(7, IdType.Default)
      }
    })

    bench('TypeScript: createId() 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateId(7, 'default')
      }
    })

    bench('WASM: createId() various sizes 1000 times', () => {
      const sizes = [5, 7, 10, 12, 15]
      for (let i = 0; i < 1000; i++) {
        const size = sizes[i % sizes.length]
        createId(size, IdType.Default)
      }
    })

    bench('TypeScript: createId() various sizes 1000 times', () => {
      const sizes = [5, 7, 10, 12, 15]
      for (let i = 0; i < 1000; i++) {
        const size = sizes[i % sizes.length]
        utilsCreateId(size, 'default')
      }
    })
  })

  describe('Seeded ID Generation Performance', () => {
    bench('WASM: createIdBySeed() 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        createIdBySeed(`seed-${i}`, 7, IdType.Default)
      }
    })

    bench('TypeScript: createIdBySeed() 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateIdBySeed(`seed-${i}`, 7, 'default')
      }
    })

    bench('WASM: createIdBySeed() same seed 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        createIdBySeed('benchmark-seed', 7, IdType.Default)
      }
    })

    bench('TypeScript: createIdBySeed() same seed 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        utilsCreateIdBySeed('benchmark-seed', 7, 'default')
      }
    })
  })

  describe('Name Generation Performance', () => {
    const existingNames = Array.from({ length: 100 }, (_, i) => `Item ${i}`)

    bench('WASM: getName() no conflicts 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        getName(`NewItem${i}`, existingNames)
      }
    })

    bench('TypeScript: getName() no conflicts 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        utilsGetName(`NewItem${i}`, existingNames)
      }
    })

    const conflictingNames = Array.from({ length: 50 }, (_, i) =>
      i === 0 ? 'Panel' : `Panel (${i})`
    )

    bench('WASM: getName() with conflicts 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        getName('Panel', conflictingNames)
      }
    })

    bench('TypeScript: getName() with conflicts 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        utilsGetName('Panel', conflictingNames)
      }
    })
  })

  describe('Mixed Workload Performance', () => {
    bench('WASM: Mixed operations 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        // ID生成
        const randomId = createId(7, IdType.User)
        const seededId = createIdBySeed(`seed-${i}`, 7, IdType.Project)

        // 名前生成
        const uniqueName = getName('Item', [`Item`, 'Item (1)', randomId])

        // 乱数生成
        const rng = gnrng(`mixed-${i}`)
        rng.next()
        rng.nextRange(1, 100)
        rng.free()
      }
    })

    bench('TypeScript: Mixed operations 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        // ID生成
        const randomId = utilsCreateId(7, 'user')
        const seededId = utilsCreateIdBySeed(`seed-${i}`, 7, 'project')

        // 名前生成
        const uniqueName = utilsGetName('Item', [`Item`, 'Item (1)', randomId])

        // 乱数生成
        const rng = utilsGnrng(`mixed-${i}`)
        rng()
        const value = rng()
        Math.floor(value * 99) + 1 // 1-100の範囲
      }
    })
  })

  describe('Memory Intensive Performance', () => {
    bench('WASM: Large batch ID generation (10000 IDs)', () => {
      const ids = []
      for (let i = 0; i < 10000; i++) {
        ids.push(createIdBySeed(`batch-${i}`, 10, IdType.Default))
      }
    })

    bench('TypeScript: Large batch ID generation (10000 IDs)', () => {
      const ids = []
      for (let i = 0; i < 10000; i++) {
        ids.push(utilsCreateIdBySeed(`batch-${i}`, 10, 'default'))
      }
    })

    bench('WASM: Long-running GNRNG (100000 values)', () => {
      const rng = new Gnrng('long-running-seed')
      for (let i = 0; i < 100000; i++) {
        rng.next()
      }
      rng.free()
    })

    bench('TypeScript: Long-running GNRNG (100000 values)', () => {
      const rng = utilsGnrng('long-running-seed')
      for (let i = 0; i < 100000; i++) {
        rng()
      }
    })
  })

  describe('GNRNG Instance Creation Performance', () => {
    bench('WASM: GNRNG instance creation 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        const rng = new Gnrng(`instance-${i}`)
        rng.free()
      }
    })

    bench('TypeScript: GNRNG instance creation 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        const rng = utilsGnrng(`instance-${i}`)
        // TypeScript版は関数なので特別な破棄処理なし
      }
    })

    bench('WASM: GNRNG create + use + free 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        const rng = new Gnrng(`instance-${i}`)
        rng.next()
        rng.nextRange(1, 100)
        rng.free()
      }
    })

    bench('TypeScript: GNRNG create + use 1000 times', () => {
      for (let i = 0; i < 1000; i++) {
        const rng = utilsGnrng(`instance-${i}`)
        rng()
        const value = rng()
        Math.floor(value * 99) + 1
      }
    })
  })

  describe('Edge Case Performance', () => {
    bench('WASM: Very long seed strings (1000 times)', () => {
      const longSeed = 'a'.repeat(1000)
      for (let i = 0; i < 1000; i++) {
        const rng = new Gnrng(`${longSeed}-${i}`)
        rng.next()
        rng.free()
      }
    })

    bench('TypeScript: Very long seed strings (1000 times)', () => {
      const longSeed = 'a'.repeat(1000)
      for (let i = 0; i < 1000; i++) {
        const rng = utilsGnrng(`${longSeed}-${i}`)
        rng()
      }
    })

    bench('WASM: Large ID sizes (100 times, size=100)', () => {
      for (let i = 0; i < 100; i++) {
        createIdBySeed(`large-${i}`, 100, IdType.Default)
      }
    })

    bench('TypeScript: Large ID sizes (100 times, size=100)', () => {
      for (let i = 0; i < 100; i++) {
        utilsCreateIdBySeed(`large-${i}`, 100, 'default')
      }
    })

    const largeExistingList = Array.from(
      { length: 1000 },
      (_, i) => `Item ${i}`
    )

    bench('WASM: getName() with large existing list (100 times)', () => {
      for (let i = 0; i < 100; i++) {
        getName(`NewItem`, largeExistingList)
      }
    })

    bench('TypeScript: getName() with large existing list (100 times)', () => {
      for (let i = 0; i < 100; i++) {
        utilsGetName(`NewItem`, largeExistingList)
      }
    })
  })
})

// ベンチマーク結果の分析用ヘルパー
describe('Benchmark Analysis', () => {
  bench('Performance baseline check', () => {
    // 基準となる軽量処理
    for (let i = 0; i < 1000; i++) {
      Math.random()
    }
  })

  bench('WASM overhead measurement', () => {
    // WASMの基本的なオーバーヘッドを測定
    for (let i = 0; i < 1000; i++) {
      const rng = new Gnrng('test')
      rng.free()
    }
  })
})
