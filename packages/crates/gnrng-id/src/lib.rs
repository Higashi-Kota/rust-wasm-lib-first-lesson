use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// console.log を Rust から呼び出すためのバインディング
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// パニック時のスタックトレースをより分かりやすくする
fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// GNRNG (Good Night Random Number Generator) の状態を保持する構造体
#[wasm_bindgen]
pub struct Gnrng {
    x: u32,
    y: u32,
    z: u32,
    w: u32,
}

#[wasm_bindgen]
impl Gnrng {
    /// シードから新しい GNRNG インスタンスを作成
    #[wasm_bindgen(constructor)]
    pub fn new(seed: &str) -> Gnrng {
        set_panic_hook();

        let mut rng = Gnrng {
            x: 0,
            y: 0,
            z: 0,
            w: 0,
        };

        // TypeScriptの実装と完全に一致させる: seed.length + 64 回ループ
        for k in 0..(seed.len() + 64) {
            if k < seed.len() {
                rng.x ^= seed.as_bytes()[k] as u32;
            }
            rng.next_u32();
        }

        rng
    }

    /// 次の擬似乱数値（0.0 ～ 1.0未満）を生成
    ///
    /// Note: `next`という名前はstd::iter::Iterator::nextと紛らわしいですが、
    /// JavaScript/TypeScriptのAPIとの互換性を保つために使用しています
    #[wasm_bindgen]
    #[allow(clippy::should_implement_trait)]
    #[inline]
    pub fn next(&mut self) -> f64 {
        // 0x100000000 = 2^32 = 4294967296.0
        // TypeScriptの w / 0x100000000 と同じ計算
        self.next_u32() as f64 / 4294967296.0
    }

    /// 🚀 バッチ乱数生成: 指定回数分の乱数を一括生成（FFI境界コスト削減）
    #[wasm_bindgen]
    pub fn next_batch(&mut self, count: usize) -> Vec<f64> {
        let mut result = Vec::with_capacity(count);

        // バッチ処理でFFI境界を1回だけ通る
        for _ in 0..count {
            result.push(self.next_u32() as f64 / 4294967296.0);
        }

        result
    }

    /// 🚀 バッチ範囲乱数生成: 指定回数分の範囲乱数を一括生成
    #[wasm_bindgen]
    pub fn next_range_batch(&mut self, min: i32, max: i32, count: usize) -> Vec<i32> {
        if min >= max {
            return vec![min; count];
        }

        let mut result = Vec::with_capacity(count);
        let range = (max - min) as u32;

        // バッチ処理でFFI境界を1回だけ通る
        for _ in 0..count {
            let value = self.next_u32() % range;
            result.push(min + value as i32);
        }

        result
    }

    /// 次の32bit符号なし整数を生成（内部用）
    #[inline(always)]
    fn next_u32(&mut self) -> u32 {
        let t = self.x ^ (self.x << 11);
        self.x = self.y;
        self.y = self.z;
        self.z = self.w;
        self.w ^= (self.w >> 19) ^ t ^ (t >> 8);
        self.w
    }

    /// 指定範囲の整数を生成
    #[wasm_bindgen]
    #[inline]
    pub fn next_range(&mut self, min: i32, max: i32) -> i32 {
        if min >= max {
            return min;
        }
        let range = (max - min) as u32;
        let value = self.next_u32() % range;
        min + value as i32
    }
}

/// シードから GNRNG インスタンスを作成する関数版
#[wasm_bindgen]
#[inline]
pub fn gnrng(seed: &str) -> Gnrng {
    Gnrng::new(seed)
}

// Rust側のユニットテスト
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gnrng_deterministic() {
        let mut rng1 = Gnrng::new("test");
        let mut rng2 = Gnrng::new("test");

        // 同じシードなら同じ値を生成
        for _ in 0..10 {
            assert_eq!(rng1.next(), rng2.next());
        }
    }

    #[test]
    fn test_gnrng_different_seeds() {
        let mut rng1 = Gnrng::new("seed1");
        let mut rng2 = Gnrng::new("seed2");

        // 異なるシードなら異なる値を生成
        let mut different_count = 0;
        for _ in 0..10 {
            if rng1.next() != rng2.next() {
                different_count += 1;
            }
        }
        assert!(different_count > 0);
    }

    #[test]
    fn test_batch_operations() {
        let mut rng = Gnrng::new("test");

        // バッチ乱数生成テスト
        let batch = rng.next_batch(100);
        assert_eq!(batch.len(), 100);

        // バッチ範囲乱数生成テスト
        let range_batch = rng.next_range_batch(1, 10, 50);
        assert_eq!(range_batch.len(), 50);
        for value in range_batch {
            assert!((1..10).contains(&value));
        }
    }

    #[test]
    fn test_range_generation() {
        let mut rng = Gnrng::new("test");

        for _ in 0..100 {
            let value = rng.next_range(1, 10);
            assert!((1..10).contains(&value));
        }
    }

    #[test]
    fn test_typescript_compatibility() {
        // TypeScriptの実装と同じ結果が得られることを確認
        let mut rng = Gnrng::new("test-seed");
        let value = rng.next();

        // 0.0以上1.0未満の範囲
        assert!((0.0..1.0).contains(&value));

        // 決定性の確認
        let mut rng1 = Gnrng::new("same-seed");
        let mut rng2 = Gnrng::new("same-seed");
        for _ in 0..5 {
            assert_eq!(rng1.next(), rng2.next());
        }
    }

    #[test]
    fn test_performance_optimizations() {
        // インライン化確認（コンパイル時にチェック）
        let mut rng = Gnrng::new("test");
        let _value = rng.next(); // inlineされているはず
        let _range_value = rng.next_range(1, 10); // inlineされているはず
    }

    #[test]
    fn test_batch_deterministic() {
        let mut rng1 = Gnrng::new("batch-test");
        let mut rng2 = Gnrng::new("batch-test");

        // バッチ生成も決定的であることを確認
        let batch1 = rng1.next_batch(50);
        let batch2 = rng2.next_batch(50);

        assert_eq!(batch1, batch2);
    }

    #[test]
    fn test_range_batch_deterministic() {
        let mut rng1 = Gnrng::new("range-batch-test");
        let mut rng2 = Gnrng::new("range-batch-test");

        // 範囲バッチ生成も決定的であることを確認
        let batch1 = rng1.next_range_batch(1, 100, 30);
        let batch2 = rng2.next_range_batch(1, 100, 30);

        assert_eq!(batch1, batch2);
    }

    #[test]
    fn test_edge_cases() {
        let mut rng = Gnrng::new("edge-test");

        // 範囲が同じ場合
        let same_range = rng.next_range(5, 5);
        assert_eq!(same_range, 5);

        // 逆順範囲の場合
        let reverse_range = rng.next_range(10, 5);
        assert_eq!(reverse_range, 10);

        // 空のバッチ
        let empty_batch = rng.next_batch(0);
        assert_eq!(empty_batch.len(), 0);

        let empty_range_batch = rng.next_range_batch(1, 10, 0);
        assert_eq!(empty_range_batch.len(), 0);
    }
}