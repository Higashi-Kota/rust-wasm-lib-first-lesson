# App - GNRNG-ID Demo Application

React + TypeScript + Vite アプリケーションで @nap5/gnrng-id ライブラリのデモンストレーション

## 🎯 目的

- **GNRNG-ID統合**: @nap5/gnrng-id ライブラリの実践的な使用例
- **パフォーマンステスト**: WASM vs TypeScript のベンチマーク比較
- **開発体験**: ホットリロード対応の最新開発環境
- **実用例**: 乱数生成とID作成の実装例とパフォーマンス測定

## ✨ 特徴

- 🦀 **@nap5/gnrng-id統合** - Rust WASM による高速な乱数生成とID作成  
- ⚛️ **React 18** - モダンなUIライブラリとHooks
- 🎨 **TailwindCSS** - レスポンシブでモダンなデザイン
- ⚡ **Vite** - 高速な開発サーバーとビルドツール
- 🧪 **Vitest** - 包括的なテストカバレッジ
- 📊 **ベンチマーク** - リアルタイムパフォーマンス測定
- 📱 **レスポンシブ対応** - デスクトップ・モバイル両対応

## 🚀 起動方法

### 前提条件

```bash
# WASMクレートのビルドが必要
pnpm run build:wasm

# または完全セットアップ
pnpm run setup
```

### 開発モード

```bash
# 基本的な開発サーバー起動
pnpm dev

# WASM監視 + React開発サーバー（推奨）
pnpm run dev:all

# フル開発環境（Utils + WASM + React）
pnpm run dev:watch
```

### 本番ビルド

```bash
# 本番用ビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

## 🏗️ アーキテクチャ

### コンポーネント構成

```
src/
├── components/
│   ├── Header.tsx              # アプリヘッダー
│   ├── Footer.tsx              # アプリフッター
│   └── BenchmarkDemo.tsx       # メインコンポーネント
├── mocks/
│   └── vitest.setup.ts         # テスト用WASMモック
├── tests/
│   └── gnrng-id.test.ts        # ライブラリ統合テスト
├── App.tsx                     # メインアプリケーション
├── main.tsx                    # エントリーポイント + WASM初期化
└── index.css                   # グローバルスタイル
```

### WASM統合

```typescript
// main.tsx でのWASM初期化
import { initWasm } from '@nap5/gnrng-id'

async function init() {
  try {
    await initWasm()
    console.log('✅ GNRNG-ID WASM module initialized successfully!')
    // React アプリレンダリング
  } catch (error) {
    console.error('❌ Failed to initialize GNRNG-ID WASM module:', error)
  }
}
```

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 開発
pnpm dev                  # React開発サーバー起動 (port 5000)
pnpm dev:all             # WASM監視 + React開発サーバー（推奨）

# ビルド
pnpm build               # TypeScript + Vite 本番ビルド
pnpm preview             # ビルド結果プレビュー (port 5000)

# テスト
pnpm test                # テスト実行（watch モード）
pnpm test:run            # テスト実行（ワンショット）
pnpm test:ui             # テストUI起動
pnpm test:coverage       # カバレッジ付きテスト

# コード品質
pnpm check               # Biome チェック
pnpm check:fix           # Biome 自動修正
pnpm format              # コードフォーマット
pnpm typecheck           # TypeScript型チェック

# 依存関係
pnpm package:check       # 依存関係の更新確認（taze）
```

## 🧪 テスト戦略

### テスト構成

- **コンポーネントテスト**: React Testing Library + Vitest
- **WASMモック**: テスト時はJavaScript実装で代替
- **統合テスト**: @nap5/gnrng-id ライブラリの動作確認
- **カバレッジ**: コンポーネント・統合機能の網羅

### テスト実行パターン

```bash
# 🔍 開発中の継続テスト（推奨）
pnpm test

# 🚀 CI/CD用テスト
pnpm test:run

# 📊 カバレッジレポート
pnpm test:coverage
open coverage/index.html

# 🎯 ビジュアルテストUI
pnpm test:ui
```

### WASMモック設定

```typescript
// vitest.setup.ts
vi.mock('@nap5/gnrng-id', () => ({
  initWasm: vi.fn().mockResolvedValue(undefined),
  Gnrng: MockGnrng,
  createIdBySeed: vi.fn(),
  IdType: { User: 'user', Team: 'team', Project: 'project', Default: 'default' },
  // ...
}))
```

## 📦 依存関係

### 実行時依存関係

```json
{
  "@nap5/gnrng-id": "workspace:*",    // GNRNG-ID WASMライブラリ
  "react": "^18.3.1",                 // UIライブラリ
  "react-dom": "^18.3.1"              // DOM操作
}
```

### 開発依存関係

```json
{
  "@vitejs/plugin-react": "^4.4.1",      // React Viteプラグイン
  "@testing-library/react": "^16.3.0",   // コンポーネントテスト
  "tailwindcss": "^3.4.17",              // CSSフレームワーク
  "vitest": "^3.1.4",                    // テストフレームワーク
  "@biomejs/biome": "1.9.4"               // リンター・フォーマッター
}
```

## 🎨 スタイリング

### TailwindCSS設定

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  ...sharedConfig,
}
```

## 🔧 機能詳細

### ベンチマークデモ

**BenchmarkDemo** コンポーネントでは以下のテストが実行できます：

- **🎲 GNRNG 乱数生成**: 個別 vs バッチ処理のパフォーマンス比較
- **🎯 GNRNG 範囲乱数**: 指定範囲内の整数生成のベンチマーク
- **🆔 シードID生成**: 決定的ID生成のパフォーマンス測定
- **🔄 混合処理**: 乱数とID生成を組み合わせた実用的なテスト

### パフォーマンス測定

```typescript
// 典型的なベンチマーク実行例
const wasmRng = new Gnrng('benchmark-seed')
const start = performance.now()
const results = wasmRng.nextBatch(10000) // バッチ処理
const end = performance.now()
console.log(`処理時間: ${end - start}ms`)
wasmRng.free()
```

## 🚀 デプロイ

### 静的ファイル

```bash
# ビルド
pnpm build

# dist/ フォルダが生成される
# 任意の静的ホスティングサービスにデプロイ可能
```

### Docker

プロジェクトルートの `Dockerfile` を使用：

```bash
# Dockerビルド
docker build -t gnrng-id-demo .

# 実行
docker run -p 3000:3000 gnrng-id-demo
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. WASM初期化エラー
```bash
# 解決方法
pnpm run clean:wasm
pnpm run build:wasm
pnpm install
```

#### 2. 型定義エラー
```bash
# 解決方法  
pnpm typecheck
# VSCode: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

#### 3. テスト失敗
```bash
# WASMモックの問題の場合
rm -rf node_modules/.vitest
pnpm test:run
```

#### 4. ホットリロードが効かない
```bash
# Viteキャッシュクリア
pnpm dev --force
```

## 🔗 関連パッケージ

- [`@nap5/gnrng-id`](../lib) - GNRNG-ID WASMライブラリ
- [`@internal/utils`](../utils) - TypeScriptユーティリティライブラリ
- [`@internal/shared-config`](../shared-config) - 共通設定ファイル

## 📈 パフォーマンス期待値

### WASM vs JavaScript比較

TBD

- 個別より、バッチ実行の方が基本早い
- gnrngはバッチサイズ大きいほど有利で早い
- createIdはバッチサイズが小さい（100個ほど）とNativeの方が早く、バッチサイズが大きい（1000個以上）とwasmの方が早い

### 最適化のポイント

- **バッチ処理**: 複数の処理を一度にWASMに送信
- **メモリ効率**: 適切な`free()`呼び出しでメモリリーク防止
- **並列処理**: 非同期処理での適切な初期化タイミング

---

詳細な開発ガイドは [プロジェクトのREADME](../../README.md) を参照してください。