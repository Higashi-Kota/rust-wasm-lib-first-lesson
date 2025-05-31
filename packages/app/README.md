# App - Rust WASM × React デモアプリケーション

RustのWebAssembly（WASM）モジュールとReact+TypeScriptを統合したモダンなWebアプリケーションのデモンストレーション

## 🎯 目的

- **Rust WASM統合**: RustのWASMクレートとReactの相互運用のデモ
- **高性能計算処理**: ブラウザ上でのネイティブレベルの処理速度
- **開発体験**: ホットリロード対応の最新開発環境
- **実用例**: 数学計算、テキスト処理、ユーティリティ機能の実装例

## ✨ 特徴

- 🦀 **Rust WASM統合** - 高速な計算処理をブラウザで実行  
- ⚛️ **React 18** - モダンなUIライブラリとHooks
- 🎨 **TailwindCSS** - レスポンシブでモダンなデザイン
- ⚡ **Vite** - 高速な開発サーバーとビルドツール
- 🧪 **Vitest** - 包括的なテストカバレッジ
- 🔄 **ホットリロード** - Rust/React両方の変更を即座に反映
- 📱 **レスポンシブ対応** - デスクトップ・モバイル両対応

## 🚀 起動方法

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
│   ├── MathCalculator/         # 数学計算デモ
│   │   ├── MathCalculator.tsx
│   │   ├── MathCalculator.test.tsx
│   │   └── index.ts
│   ├── TextProcessor/          # テキスト処理デモ
│   │   ├── TextProcessor.tsx
│   │   ├── TextProcessor.test.tsx
│   │   └── index.ts
│   └── UtilityTools/           # ユーティリティデモ
│       ├── UtilityTools.tsx
│       ├── UtilityTools.test.tsx
│       └── index.ts
├── mocks/
│   └── vitest.setup.ts         # テスト用WASMモック
├── App.tsx                     # メインアプリケーション
├── main.tsx                    # エントリーポイント + WASM初期化
└── index.css                   # グローバルスタイル
```

### WASM統合

```typescript
// main.tsx でのWASM初期化
import initMath from '@internal/wasm-math'
import initText from '@internal/wasm-text' 
import initUtils from '@internal/wasm-utils'

async function init() {
  await Promise.all([initMath(), initText(), initUtils()])
  // React アプリレンダリング
}
```

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 開発
pnpm dev                  # React開発サーバー起動
pnpm dev:all             # WASM監視 + React開発サーバー（推奨）

# ビルド
pnpm build               # TypeScript + Vite 本番ビルド
pnpm preview             # ビルド結果プレビュー

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
- **インテグレーションテスト**: ユーザー操作シナリオの検証
- **カバレッジ**: コンポーネント・フック・ユーティリティの網羅

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
vi.mock('@internal/wasm-math', () => ({
  add: vi.fn((a: number, b: number) => a + b),
  div: vi.fn((a: number, b: number) => {
    if (b === 0) throw new Error('0で除算することはできません')
    return a / b
  }),
  // ...
}))
```

## 📦 依存関係

### 実行時依存関係

```json
{
  "@internal/wasm-math": "workspace:*",    // 数学計算WASM
  "@internal/wasm-text": "workspace:*",   // テキスト処理WASM
  "@internal/wasm-utils": "workspace:*",  // ユーティリティWASM
  "react": "^18.3.1",                     // UIライブラリ
  "react-dom": "^18.3.1"                  // DOM操作
}
```

### 開発依存関係

```json
{
  "@vitejs/plugin-react": "^4.4.1",      // React Viteプラグイン
  "@testing-library/react": "^16.3.0",   // コンポーネントテスト
  "tailwindcss": "^3.4.17",              // CSSフレームワーク
  "vitest": "^3.1.4",                     // テストフレームワーク
  "@biomejs/biome": "1.9.4"               // リンター・フォーマッター
}
```

## 🎨 スタイリング

### TailwindCSS設定

```javascript
// tailwind.config.js
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../dock/src/**/*.{js,ts,jsx,tsx}'  // 他パッケージも含める
  ],
  // 共通設定を継承
  ...sharedConfig,
}
```

## 🔧 カスタマイズ

### 新しいWASMモジュールの追加

```typescript
// 1. WASMクレートを packages/crates/ に追加
// 2. main.tsx で初期化を追加
import initNewModule from '@internal/wasm-new-module'

async function init() {
  await Promise.all([
    initMath(), 
    initText(), 
    initUtils(),
    initNewModule()  // 追加
  ])
}

// 3. 新しいコンポーネントで使用
import { newFunction } from '@internal/wasm-new-module'
```

### 新しいデモコンポーネントの追加

```typescript
// components/NewDemo/NewDemo.tsx
export function NewDemo() {
  // WASMモジュール使用
  return <section className="card">...</section>
}

// App.tsx で追加
import { NewDemo } from '@/components/NewDemo'

function App() {
  return (
    <div className="grid gap-8 grid-auto-fit">
      <MathCalculator />
      <TextProcessor />
      <UtilityTools />
      <NewDemo />  {/* 追加 */}
    </div>
  )
}
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

## 🔗 関連パッケージ

- [`@internal/wasm-math`](../crates/wasm-math) - 数学計算WASMクレート
- [`@internal/wasm-text`](../crates/wasm-text) - テキスト処理WASMクレート  
- [`@internal/wasm-utils`](../crates/wasm-utils) - ユーティリティWASMクレート
- [`@internal/utils`](../utils) - TypeScriptユーティリティライブラリ
- [`@internal/shared-config`](../shared-config) - 共通設定ファイル

## 📈 パフォーマンス

### WASM vs JavaScript比較

| 処理 | JavaScript | WASM (Rust) | 改善倍率 |
|------|------------|-------------|----------|
| フィボナッチ数列(n=40) | ~100ms | ~5ms | **20x** |
| 素数判定(大きな数) | ~50ms | ~3ms | **16x** |
| テキスト処理(長文) | ~20ms | ~2ms | **10x** |

### 最適化のポイント

- **バッチ処理**: 複数の計算を一度にWASMに送信
- **メモリ効率**: WASMでの文字列・配列の効率的な扱い
- **並列処理**: Promise.allによる非同期処理の並列化

---

詳細な開発ガイドは [プロジェクトのREADME](../../README.md) を参照してください。