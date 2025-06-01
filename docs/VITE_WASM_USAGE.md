新規Viteプロジェクトで`@nap5/gnrng-id`を使用するには、以下の設定が必要です：

## 使用手順

### 0. セットアップ

```bash
npm create vite@latest test-app -- --template react-ts
cd test-app/
npm install
npm install @nap5/gnrng-id
```

### 1. vite-plugin-wasmをインストール

```bash
npm install -D vite-plugin-wasm vite-plugin-top-level-await
```

### 2. パッケージ依存関係の確認

```bash
# 必要なパッケージがインストールされているか確認
npm list @nap5/gnrng-id
npm list @nap5/gnrng-id-wasm
```

### 3. vite.config.tsを設定

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    exclude: ['@nap5/gnrng-id-wasm']
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
```

### 4. main.tsxを修正

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initWasm } from '@nap5/gnrng-id'

async function init() {
  try {
    await initWasm()
    console.log('✅ GNRNG-ID WASM module initialized successfully!')
    
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    console.error('❌ Failed to initialize GNRNG-ID WASM module:', error)
  }
}

init()
```

### 5. App.tsxを修正

```tsx
import { useState } from 'react'
import { createIdBySeed, Gnrng, IdType } from '@nap5/gnrng-id'

function App() {
  const [id, setId] = useState<string>('')
  const [randomValue, setRandomValue] = useState<number>(0)

  const generateId = () => {
    try {
      const newId = createIdBySeed('test-seed', 8, IdType.User)
      setId(newId)
    } catch (error) {
      console.error('ID生成エラー:', error)
    }
  }

  const generateRandom = () => {
    try {
      const rng = new Gnrng('random-seed')
      const value = rng.next()
      setRandomValue(value)
      rng.free() // メモリ解放
    } catch (error) {
      console.error('乱数生成エラー:', error)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🦀 GNRNG-ID Demo</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={generateId}>
          Generate ID
        </button>
        <p>Generated ID: {id}</p>
      </div>
      
      <div>
        <button onClick={generateRandom}>
          Generate Random Number
        </button>
        <p>Random Value: {randomValue}</p>
      </div>
    </div>
  )
}

export default App
```

## なぜpackages/appでは動作するのか？

packages/appが正常に動作する理由：

1. **モノレポ環境**: ワークスペース内で直接WASMパッケージが参照されている
2. **開発時のファイルパス**: `packages/crates/gnrng-id/pkg/`から直接WASMファイルが読み込まれている
3. **Vite設定**: `server.fs.allow: ['..', '../..']`でファイルアクセスが許可されている

## トラブルシューティング

1. **キャッシュクリア**: `npm run dev -- --force`
2. **ノードモジュール再インストール**: `rm -rf node_modules package-lock.json && npm install`
3. **ブラウザ開発者ツール**: ネットワークタブでWASMファイルの読み込み状況を確認

この設定により、新規Viteプロジェクトでも`packages/app`と同様に`@nap5/gnrng-id`を使用できるようになります。