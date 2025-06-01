# @nap5/gnrng-id

[![npm version](https://badge.fury.io/js/@nap5%2Fgnrng-id.svg)](https://badge.fury.io/js/@nap5%2Fgnrng-id)
[![JSR](https://jsr.io/badges/@nap5/gnrng-id)](https://jsr.io/@nap5/gnrng-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**GNRNG (Good Night Random Number Generator)** with ID generation utilities powered by **WebAssembly** and **Rust**.

High-performance, deterministic random number generation and ID utilities for modern JavaScript/TypeScript applications.

## ✨ Features

- 🦀 **Rust + WebAssembly**: High-performance core implementation
- 🔒 **Deterministic**: Seed-based reproducible random generation
- 🆔 **ID Generation**: Safe, collision-resistant ID creation
- 📦 **Dual Publishing**: Available on both npm and JSR
- 🌐 **Universal**: Works in Node.js, Deno, and browsers
- ⚡ **Fast**: Batch operations for optimal FFI performance
- 🔧 **Type Safe**: Full TypeScript support with generated types
- 🧪 **Well Tested**: Comprehensive test suite with benchmarks

## 🚀 Installation

### npm

```bash
npm install @nap5/gnrng-id
```

### JSR (for Deno)

```bash
deno add @nap5/gnrng-id
```

### Browser (CDN)

```html
<script type="module">
  import { createId, createIdBySeed } from 'https://esm.sh/@nap5/gnrng-id'
</script>
```

## ⚡ Quick Start

### Basic Usage

```typescript
import { initWasm, createId, createIdBySeed, Gnrng, IdType } from '@nap5/gnrng-id'

// Initialize WASM module (required before first use)
await initWasm()

// Generate random IDs
const randomId = createId() // "t_A7Bp9X2"
const userId = createId(8, IdType.User) // "u_K3mN9Pq5"

// Generate deterministic IDs
const deterministicId = createIdBySeed('my-seed') // Always same result
const projectId = createIdBySeed('project-alpha', 10, IdType.Project) // "p_X9kM2nQ8vB"

// Use GNRNG for custom random generation
const rng = new Gnrng('my-seed')
const randomValue = rng.next() // 0.0 ~ 1.0
const randomInt = rng.nextRange(1, 100) // 1 ~ 99
rng.free() // Clean up WASM memory
```

### Batch Operations (High Performance)

```typescript
import { initWasm, createIdsBySeed, Gnrng, IdType } from '@nap5/gnrng-id'

await initWasm()

// Batch ID generation (much faster than individual calls)
const userIds = createIdsBySeed('user-batch', 1000, 8, IdType.User)
console.log(userIds.length) // 1000 unique user IDs

// Batch random number generation
const rng = new Gnrng('batch-seed')
const randomNumbers = rng.nextBatch(10000) // 10k numbers at once
const diceRolls = rng.nextRangeBatch(1, 6, 1000) // 1k dice rolls
rng.free()
```

## 📚 API Reference

### Initialization

#### `initWasm(): Promise<void>`

Initialize the WebAssembly module. Must be called before using any other functions.

```typescript
await initWasm()
```

### Random Number Generation

#### `class Gnrng`

Deterministic random number generator.

```typescript
const rng = new Gnrng('seed')

// Generate float [0.0, 1.0)
const value = rng.next()

// Generate integer [min, max)
const intValue = rng.nextRange(1, 100)

// 🚀 Batch operations (high performance)
const batch = rng.nextBatch(1000)              // 1000 floats
const rangeBatch = rng.nextRangeBatch(1, 10, 500) // 500 integers [1, 10)

// Clean up (important for memory management)
rng.free()
```

#### `gnrng(seed: string): Gnrng`

Factory function to create Gnrng instance.

```typescript
const rng = gnrng('my-seed')
```

### ID Generation

#### `createIdBySeed(seed: string, size?: number, type?: IdType): string`

Generate a deterministic ID based on seed.

```typescript
createIdBySeed('my-seed') // "t_A7Bp9X2"
createIdBySeed('user-123', 8, IdType.User) // "u_K3mN9Pq5"
```

#### `🚀 createIdsBySeed(baseSeed: string, count: number, size?: number, type?: IdType): string[]`

Generate multiple deterministic IDs efficiently (batch operation).

```typescript
createIdsBySeed('user-batch', 100, 8, IdType.User) // 100 unique user IDs
```

### Types

#### `IdType`

Enum for ID prefixes:

```typescript
enum IdType {
  User = 'user',      // Prefix: "u_"
  Team = 'team',      // Prefix: "tm_"
  Project = 'project', // Prefix: "p_"
  Default = 'default'  // Prefix: "t_"
}
```

## ⚡ Performance
TBD

- 個別より、バッチ実行の方が基本早い
- gnrngはバッチサイズ大きいほど有利で早い
- createIdはバッチサイズが小さい（100個ほど）とNativeの方が早く、バッチサイズが大きい（1000個以上）とwasmの方が早い

### Performance Tips

✅ **Use batch operations** for processing many items  
✅ **Initialize WASM once** at application startup  
✅ **Call `rng.free()`** to avoid memory leaks  
✅ **Prefer deterministic IDs** for reproducible results  

## 📖 Examples

### React Hook

```typescript
import { useEffect, useState } from 'react'
import { initWasm, createId, IdType } from '@nap5/gnrng-id'

function useGnrngId() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    initWasm().then(() => setInitialized(true))
  }, [])

  const generateId = (size?: number, type?: IdType) => {
    if (!initialized) throw new Error('WASM not initialized')
    return createId(size, type)
  }

  return { initialized, generateId }
}
```

### Node.js Server

```typescript
import express from 'express'
import { initWasm, createIdsBySeed, IdType } from '@nap5/gnrng-id'

const app = express()

// Initialize WASM on startup
await initWasm()

app.post('/api/users/batch', (req, res) => {
  const { count = 100 } = req.body
  
  // Generate batch of user IDs efficiently
  const userIds = createIdsBySeed(
    `batch-${Date.now()}`,
    count,
    8,
    IdType.User
  )
  
  res.json({ userIds })
})
```

### Deno Application

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { initWasm, Gnrng } from 'jsr:@nap5/gnrng-id'

await initWasm()

serve((req) => {
  const url = new URL(req.url)
  
  if (url.pathname === '/random-batch') {
    const rng = new Gnrng('server-seed')
    const numbers = rng.nextBatch(1000)
    rng.free()
    
    return new Response(JSON.stringify({ numbers }))
  }
  
  return new Response('Not Found', { status: 404 })
})
```

## 🔄 Compatibility

### Environments

- ✅ **Node.js** 18+
- ✅ **Deno** 1.40+
- ✅ **Browsers** with WASM support
- ✅ **Bun** (experimental)

### Module Systems

- ✅ **ESM** (import/export)
- ✅ **CommonJS** (require) 
- ✅ **TypeScript**
- ✅ **JSR** (Deno registry)

## 🛠️ Development

### Prerequisites

- Rust 1.86.0+
- Node.js 22+
- wasm-pack
- pnpm 10+

### Building

```bash
# Build WASM module
pnpm run build:wasm

# Build TypeScript library
pnpm run build:lib

# Build everything
pnpm run build
```

### Testing

```bash
# Run tests
pnpm test

# Run benchmarks
pnpm run benchmark

# Generate coverage
pnpm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🙏 Acknowledgments

- [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) for Rust-WASM bindings
- [nanoid](https://github.com/ai/nanoid) for alphabet inspiration
- Original GNRNG algorithm from [gnrng](https://github.com/steveruizok/gnrng)

---

<div align="center">

**Made with ❤️ by [Higashi Kota](https://github.com/Higashi-Kota)**

[🌟 Give us a star](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson) • [🐛 Report Bug](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/issues) • [💡 Request Feature](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/issues)

</div>