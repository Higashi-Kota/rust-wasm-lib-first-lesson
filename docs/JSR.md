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