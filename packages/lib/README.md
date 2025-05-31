# @nap5/gnrng-id

[![npm version](https://badge.fury.io/js/@nap5%2Fgnrng-id.svg)](https://badge.fury.io/js/@nap5%2Fgnrng-id)
[![JSR](https://jsr.io/badges/@nap5/gnrng-id)](https://jsr.io/@nap5/gnrng-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/actions/workflows/ci.yml/badge.svg)](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/actions/workflows/ci.yml)

**GNRNG (Good Night Random Number Generator)** with ID generation utilities powered by **WebAssembly** and **Rust**.

High-performance, deterministic random number generation and ID utilities for modern JavaScript/TypeScript applications.

## ✨ Features

- 🦀 **Rust + WebAssembly**: High-performance core implementation
- 🔒 **Deterministic**: Seed-based reproducible random generation
- 🆔 **ID Generation**: Safe, collision-resistant ID creation
- 📦 **Dual Publishing**: Available on both npm and JSR
- 🌐 **Universal**: Works in Node.js, Deno, and browsers
- ⚡ **Fast**: Significantly faster than pure JavaScript implementations
- 🔧 **Type Safe**: Full TypeScript support with generated types
- 🧪 **Well Tested**: Comprehensive test suite with benchmarks

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Performance](#-performance)
- [Examples](#-examples)
- [Compatibility](#-compatibility)
- [Development](#-development)
- [License](#-license)

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

### Auto-initialization API

For convenience, use the `auto` namespace to automatically initialize WASM:

```typescript
import { auto } from '@nap5/gnrng-id'

// These functions automatically initialize WASM on first call
const id = await auto.createId()
const seededId = await auto.createIdBySeed('seed')
const rng = await auto.gnrng('seed')
const uniqueName = await auto.getName('Panel', ['Panel', 'Panel (1)'])
```

### Unique Name Generation

```typescript
import { getName } from '@nap5/gnrng-id'

await initWasm()

const existingNames = ['Panel', 'Panel (1)', 'Panel (2)']
const uniqueName = getName('Panel', existingNames) // "Panel (3)"
```

## 📚 API Reference

### Initialization

#### `initWasm(): Promise<void>`

Initialize the WebAssembly module. Must be called before using any other functions (except `auto.*` functions).

```typescript
await initWasm()
```

### ID Generation

#### `createId(size?: number, type?: IdType): string`

Generate a random ID with optional size and type prefix.

- `size`: Length of random part (default: 7)
- `type`: ID type for prefix (default: `IdType.Default`)

```typescript
createId() // "t_A7Bp9X2"
createId(10, IdType.User) // "u_K3mN9Pq5vB"
```

#### `createIdBySeed(seed: string, size?: number, type?: IdType): string`

Generate a deterministic ID based on seed.

```typescript
createIdBySeed('my-seed') // Always returns same result
createIdBySeed('project-alpha', 8, IdType.Project) // "p_X9kM2nQ8"
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

// Clean up (important for memory management)
rng.free()
```

#### `gnrng(seed: string): Gnrng`

Factory function to create Gnrng instance.

```typescript
const rng = gnrng('my-seed')
```

### Utility Functions

#### `getName(baseName: string, existingNames: string[]): string`

Generate unique name avoiding conflicts.

```typescript
getName('Panel', ['Panel', 'Panel (1)']) // "Panel (2)"
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

### Async API

All functions have async variants that auto-initialize WASM:

```typescript
import { createIdAsync, createIdBySeedAsync, gnrngAsync } from '@nap5/gnrng-id'

const id = await createIdAsync()
const seededId = await createIdBySeedAsync('seed')
const rng = await gnrngAsync('seed')
```

## ⚡ Performance

WASM implementation provides significant performance improvements over pure JavaScript:

| Operation | JavaScript | WASM (Rust) | Improvement |
|-----------|------------|-------------|-------------|
| GNRNG Generation (10K) | ~45ms | ~8ms | **5.6x faster** |
| ID Creation (1K) | ~12ms | ~3ms | **4x faster** |
| Seeded ID (1K) | ~15ms | ~4ms | **3.7x faster** |
| Name Generation | ~2ms | ~0.5ms | **4x faster** |

*Benchmarks run on Node.js 22 on Apple M1 Pro*

### Running Benchmarks

```bash
npm run benchmark
# or
deno task bench
```

## 📖 Examples

### React Hook

```typescript
import { useEffect, useState } from 'react'
import { initWasm, createId } from '@nap5/gnrng-id'

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
import { initWasm, createIdBySeed, IdType } from '@nap5/gnrng-id'

const app = express()

// Initialize WASM on startup
await initWasm()

app.post('/api/users', (req, res) => {
  const userId = createIdBySeed(
    `user-${Date.now()}-${Math.random()}`,
    8,
    IdType.User
  )
  
  res.json({ id: userId })
})
```

### Deno Application

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { auto } from 'jsr:@nap5/gnrng-id'

serve(async (req) => {
  const url = new URL(req.url)
  
  if (url.pathname === '/id') {
    const id = await auto.createId()
    return new Response(JSON.stringify({ id }))
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

### Migration from `@internal/utils`

This library is designed to be a drop-in replacement:

```typescript
// Before (TypeScript implementation)
import { createId, createIdBySeed, gnrng, getName } from '@internal/utils'

// After (WASM implementation)
import { createId, createIdBySeed, gnrng, getName, initWasm } from '@nap5/gnrng-id'

await initWasm() // Only addition needed
```

## 🛠️ Development

### Prerequisites

- Rust 1.86.0+
- Node.js 18+
- wasm-pack
- pnpm 8+

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

### Releasing

```bash
# Release to npm
pnpm run publish:npm

# Release to JSR
pnpm run publish:jsr
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) for Rust-WASM bindings
- [nanoid](https://github.com/ai/nanoid) for alphabet inspiration
- Original GNRNG algorithm from [gnrng](https://github.com/steveruizok/gnrng)

---

<div align="center">

**Made with ❤️ by [Higashi Kota](https://github.com/Higashi-Kota)**

[🌟 Give us a star](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson) • [🐛 Report Bug](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/issues) • [💡 Request Feature](https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/issues)

</div>