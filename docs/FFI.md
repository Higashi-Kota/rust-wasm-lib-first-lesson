### 📖 **FFIとは？**

**FFI = Foreign Function Interface（フォーリン ファンクション インターフェース）**

→ **「他の言語で作られた関数を呼び出す仕組み」** のことです。

---

### 🚪 **イメージ**

| 主な世界                                   | 呼び出す相手 | FFIの発生 |
| -------------------------------------- | ------ | ------ |
| **JavaScript** → **WASM (Rustで作った関数)** | FFI発生  |        |
| **WASM (Rust)** → **JavaScript関数**     | FFI発生  |        |
| **Python** → **Cライブラリ** (例: numpyの内部)  | FFI発生  |        |
| **Java** → **C/C++** (`JNI`)           | FFI発生  |        |

---

### 🚦 **なぜ遅くなるの？**

通常：

```
JavaScript → JavaScript関数呼び出し → めちゃくちゃ速い (JIT最適化OK)
Rust (ネイティブ) → Rust関数呼び出し → めちゃくちゃ速い (LLVM最適化OK)
```

でも FFI 呼び出しになると：

```
JavaScript → (VMの境界を越える) → WASM関数呼び出し → 遅い
```

**境界を越えるときに：「型の変換」「メモリ位置確認」「呼び出しの準備」など色々やるため、意外とコストが大きい**。

1回あたり **100ns〜1μs** と言われています。

---

### 💡 **例: GNRNG.next()**

今のコード：

```ts
const rng = new WasmGnrng('benchmark-seed')
for (let i = 0; i < iterationCount; i++) {
    rng.next()  // ← これが 1回ずつ JS → WASM 呼び出し (FFI) している
}
rng.free()
```

---

**問題点：**

`rng.next()` 1回呼ぶたびに **FFIコストが発生** → 実質 "関数呼び出しそのもの" が重くなってしまう。

---

### 🏎 **高速化する方法**

**バッチAPIにする**

Rust側に：

```rust
#[wasm_bindgen]
pub fn next_n(seed: &str, count: usize) -> Vec<u32> {
    let mut rng = Gnrng::new(seed);
    (0..count).map(|_| rng.next()).collect()
}
```

JS側では：

```ts
next_n('benchmark-seed', 10000)  // 1回の FFI で一気に処理
```

---

**結果：**

| パターン           | FFI回数            | 性能                 |
| -------------- | ---------------- | ------------------ |
| 1回ずつ next()    | iterationCount 回 | 遅い                 |
| next\_n(count) | 1回だけ             | 10倍〜100倍 速くなることがある |

---

### 🎁 **まとめ**

✅ **FFI = 言語をまたぐ関数呼び出し**
✅ **JS → WASM は FFIコストが意外と高い**
✅ **next() のような小さい関数を大量に呼ぶと FFI のせいで遅くなる**
✅ **→ next\_n() のようなバッチ関数にするのが Rust WASM の王道最適化パターン**

---
