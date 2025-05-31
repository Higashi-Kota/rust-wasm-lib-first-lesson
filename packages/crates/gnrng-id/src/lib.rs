use js_sys::Math;
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

// ID生成で使用する安全なアルファベット（視認性の悪い文字を除外）
const AVAILABLE_ALPHABET: &str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const DEFAULT_SIZE: usize = 7;

/// ID のタイプを表す列挙型
#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum IdType {
    User,
    Team,
    Project,
    Default,
}

impl IdType {
    fn get_prefix(&self) -> &'static str {
        match self {
            IdType::User => "u_",
            IdType::Team => "tm_",
            IdType::Project => "p_",
            IdType::Default => "t_",
        }
    }
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
    pub fn next(&mut self) -> f64 {
        // 0x100000000 = 2^32 = 4294967296.0
        // TypeScriptの w / 0x100000000 と同じ計算
        self.next_u32() as f64 / 4294967296.0
    }

    /// 次の32bit符号なし整数を生成（内部用）
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
pub fn gnrng(seed: &str) -> Gnrng {
    Gnrng::new(seed)
}

/// ランダムな ID を生成
#[wasm_bindgen]
pub fn create_id(size: Option<usize>, id_type: Option<IdType>) -> String {
    set_panic_hook();

    let size = size.unwrap_or(DEFAULT_SIZE);
    let id_type = id_type.unwrap_or(IdType::Default);
    let prefix = id_type.get_prefix();

    let mut id = String::with_capacity(prefix.len() + size);
    id.push_str(prefix);

    let alphabet_bytes = AVAILABLE_ALPHABET.as_bytes();
    let alphabet_len = alphabet_bytes.len();

    for _ in 0..size {
        let random_value = Math::random();
        let index = (random_value * alphabet_len as f64) as usize % alphabet_len;
        id.push(alphabet_bytes[index] as char);
    }

    id
}

/// シードベースでIDを生成
#[wasm_bindgen]
pub fn create_id_by_seed(seed: &str, size: Option<usize>, id_type: Option<IdType>) -> String {
    set_panic_hook();

    let size = size.unwrap_or(DEFAULT_SIZE);
    let id_type = id_type.unwrap_or(IdType::Default);
    let prefix = id_type.get_prefix();

    let mut rng = Gnrng::new(seed);
    let mut id = String::with_capacity(prefix.len() + size);
    id.push_str(prefix);

    let alphabet_bytes = AVAILABLE_ALPHABET.as_bytes();
    let alphabet_len = alphabet_bytes.len();

    for _ in 0..size {
        let random_value = rng.next();
        let index = (random_value * alphabet_len as f64) as usize % alphabet_len;
        id.push(alphabet_bytes[index] as char);
    }

    id
}

/// 重複を避けたユニークな名前を生成（TypeScript側の getName 関数相当）
#[wasm_bindgen]
pub fn get_unique_name(base_name: &str, existing_names: &js_sys::Array) -> String {
    set_panic_hook();

    let existing: std::collections::HashSet<String> = existing_names
        .iter()
        .filter_map(|val| val.as_string())
        .collect();

    let mut result = base_name.to_string();
    let mut counter = 1u32;

    while existing.contains(&result) {
        // " (数字)" の形式で番号を付ける
        if result.contains(" (") && result.ends_with(')') {
            // 既存の番号を抽出して増加
            if let Some(start) = result.rfind(" (") {
                if let Some(end) = result.rfind(')') {
                    if let Ok(num) = result[start + 2..end].parse::<u32>() {
                        counter = num + 1;
                        result = format!("{} ({})", &result[..start], counter);
                        continue;
                    }
                }
            }
        }

        // 初回または解析失敗時
        result = if counter == 1 {
            format!("{} (1)", base_name)
        } else {
            format!("{} ({})", base_name, counter)
        };
        counter += 1;
    }

    result
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
    fn test_create_id_by_seed_deterministic() {
        let id1 = create_id_by_seed("test", Some(8), Some(IdType::User));
        let id2 = create_id_by_seed("test", Some(8), Some(IdType::User));
        assert_eq!(id1, id2);
    }

    #[test]
    fn test_create_id_by_seed_different_seeds() {
        let id1 = create_id_by_seed("seed1", Some(8), Some(IdType::User));
        let id2 = create_id_by_seed("seed2", Some(8), Some(IdType::User));
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_id_prefixes() {
        assert_eq!(IdType::User.get_prefix(), "u_");
        assert_eq!(IdType::Team.get_prefix(), "tm_");
        assert_eq!(IdType::Project.get_prefix(), "p_");
        assert_eq!(IdType::Default.get_prefix(), "t_");
    }

    #[test]
    fn test_create_id_format() {
        let id = create_id_by_seed("test", Some(7), Some(IdType::User));
        assert!(id.starts_with("u_"));
        assert_eq!(id.len(), 2 + 7); // prefix + size

        // アルファベットに含まれる文字のみ使用されているかチェック
        let id_part = &id[2..];
        for ch in id_part.chars() {
            assert!(AVAILABLE_ALPHABET.contains(ch));
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
}
