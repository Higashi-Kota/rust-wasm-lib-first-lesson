# @nap5/gnrng-id-wasm

[![npm version](https://badge.fury.io/js/@nap5%2Fgnrng-id-wasm.svg)](https://badge.fury.io/js/@nap5%2Fgnrng-id-wasm)
[![JSR](https://jsr.io/badges/@nap5/gnrng-id-wasm)](https://jsr.io/@nap5/gnrng-id-wasm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**WebAssembly bindings for GNRNG (Good Night Random Number Generator)** - Core Rust implementation.

This package contains the low-level WebAssembly bindings generated from Rust code. For a more user-friendly TypeScript API, see [`@nap5/gnrng-id`](https://www.npmjs.com/package/@nap5/gnrng-id).

## ✨ Features

- 🦀 **Pure Rust Implementation**: High-performance GNRNG algorithm written in Rust
- ⚡ **WebAssembly**: Compiled to WASM for optimal performance in JavaScript environments
- 🔒 **Deterministic**: Seed-based reproducible random number generation
- 🚀 **Batch Operations**: Efficient bulk operations to minimize FFI overhead
- 🌐 **Universal**: Works in Node.js, Deno, and browsers
- 📦 **Lightweight**: Optimized WASM binary with minimal overhead

## 🚀 Installation

### npm

```bash
npm install @nap5/gnrng-id-wasm
```

### JSR (for Deno)

```bash
deno add @nap5/gnrng-id-wasm
```

## 📖 Usage

**Note**: This package provides low-level WASM bindings. For a more convenient TypeScript API, use [`@nap5/gnrng-id`](https://www.npmjs.com/package/@nap5/gnrng-id) instead.

### Basic Usage

```javascript
import init, { Gnrng } from '@nap5/gnrng-id-wasm'

// Initialize WASM module
await init()

// Create GNRNG instance
const rng = new Gnrng('my-seed')

// Generate random numbers
const value = rng.next()           // 0.0 ~ 1.0
const intValue = rng.nextRange(1, 100)  // 1 ~ 99

// Batch operations (high performance)
const batch = rng.nextBatch(1000)
const rangeBatch = rng.nextRangeBatch(1, 10, 500)

// Clean up
rng.free()
```

### Browser Usage

```html
<script type="module">
  import init, { Gnrng } from 'https://unpkg.com/@nap5/gnrng-id-wasm/pkg/gnrng_id_wasm.js'
  
  async function example() {
    await init()
    const rng = new Gnrng('browser-seed')
    console.log(rng.next())
    rng.free()
  }
  
  example()
</script>
```

## 🏗️ API Reference

### `Gnrng`

WebAssembly class for deterministic random number generation.

#### Constructor

- `new Gnrng(seed: string)`: Create a new GNRNG instance with the given seed

#### Methods

- `next(): number`: Generate next random float [0.0, 1.0)
- `nextRange(min: number, max: number): number`: Generate random integer [min, max)
- `nextBatch(count: number): Float64Array`: Generate batch of random floats
- `nextRangeBatch(min: number, max: number, count: number): Int32Array`: Generate batch of random integers
- `free(): void`: Release WASM memory (important!)

### Functions

- `init(): Promise<void>`: Initialize the WASM module

## 🔧 Building from Source

### Prerequisites

- Rust 1.86.0+
- wasm-pack

### Build Commands

```bash
# Development build
npm run build:dev

# Production build  
npm run build

# Run tests
npm test

# Check code
npm run check
npm run clippy
npm run fmt
```

## 🌟 Related Packages

- [`@nap5/gnrng-id`](https://www.npmjs.com/package/@nap5/gnrng-id) - High-level TypeScript API with ID generation utilities
- [Original GNRNG](https://github.com/steveruizok/gnrng) - JavaScript implementation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

---

**Made with ❤️ by [Higashi Kota](https://github.com/Higashi-Kota)**