## 推奨する解決策

WASMパッケージ（低レベル）とライブラリパッケージ（高レベルAPI）で異なる戦略を取ることをお勧めします

## 修正方針のまとめ

### 1. **アーキテクチャの整理**
- **WASMパッケージ** (`@nap5/gnrng-id-wasm`): npmのみでパブリッシュ
- **ライブラリパッケージ** (`@nap5/gnrng-id`): npm + JSRの両方でパブリッシュ

### 2. **実装する変更**

1. **`.github/workflows/release.yml`を更新**: 上記のartifactの内容で修正
2. **`packages/lib/jsr.json`を更新**: より適切な設定に変更
3. **`packages/crates/gnrng-id/jsr.json`を削除または無効化**: WASMはJSRパブリッシュしない

### 3. **理由**

- **JSRの特性**: TypeScript中心のレジストリで、JavaScript+型定義ファイルの組み合わせよりも、TypeScriptソースコードを直接パブリッシュすることを想定
- **WASMの特性**: バイナリ形式でコンパイルされ、JavaScript FFIバインディングを生成するため、npmエコシステムにより適している
- **ユーザー体験**: 高レベルAPIの`@nap5/gnrng-id`をJSRで提供することで、Denoユーザーにとって使いやすい

### 4. **メリット**

✅ JSRパブリッシュエラーの解決  
✅ 各レジストリの特性に適した配布  
✅ ユーザーにとって明確な使い分け  
✅ CI/CDパイプラインの安定化  

この修正により、WASMコアはnpmで、TypeScript APIはnpm+JSRの両方で提供され、それぞれのエコシステムに最適な形で配布できます。

## WASMライブラリとJSRの構造的な問題

### 1. **WASM の生成物の性質**
```bash
# wasm-pack の出力
packages/crates/gnrng-id/pkg/
├── gnrng_id_wasm.js        # 生成されたJSバインディング
├── gnrng_id_wasm.d.ts      # 生成されたTS型定義
├── gnrng_id_wasm_bg.wasm   # WASMバイナリ（バイナリファイル）
└── package.json            # 生成されたパッケージ設定
```

これらは全て**生成されたファイル**で、TypeScriptソースコードではありません。

### 2. **JSRの前提条件**
```json
// JSRが期待する構造
{
  "exports": {
    ".": "./src/index.ts"  // ← TypeScriptソースが必要
  }
}
```

JSRは：
- **TypeScriptソースコード**を直接ホスト
- Denoが実行時にTS→JSトランスパイル
- WASMバイナリの動的ロードは複雑

## WASMをラップしたライブラリの場合

### ✅ **技術的な現実**
1. **WASM = バイナリ + 生成JS** → TypeScript-pure ではない
2. **JSR = TypeScript-first** → WASMバイナリは想定外
3. **依存関係の連鎖** → WASMに依存する時点でTS-onlyにならない

### ✅ **実用的な判断**
- **npm専用配布**が最も安定
- 多くの成功しているWASMライブラリが採用
- メンテナンス負荷を削減

```bash
# npm (推奨)
npm install @nap5/gnrng-id

# Deno (npm prefix使用)
import { createId } from "npm:@nap5/gnrng-id"
```

**WASMライブラリはnpmエコシステムが最適**という結論は、技術的制約を考慮した非常に合理的な判断です。