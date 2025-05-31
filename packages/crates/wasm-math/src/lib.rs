use wasm_bindgen::prelude::*;

// パニック時の処理を改善（開発時のデバッグに有用）
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

// JavaScript側にエクスポートする関数群

/// 二つの数値を足し算します
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    set_panic_hook();

    // let result = a + b;

    // log(&format!("[Hey]add({},{}) = {}",a,b,result));

    a + b
}

/// 二つの数値を引き算します
#[wasm_bindgen]
pub fn sub(a: i32, b: i32) -> i32 {
    set_panic_hook();
    a - b
}

/// 二つの数値を掛け算します
#[wasm_bindgen]
pub fn mul(a: i32, b: i32) -> i32 {
    set_panic_hook();
    a * b
}

/// 二つの数値を割り算します（0での除算はパニックします）
#[wasm_bindgen]
pub fn div(a: i32, b: i32) -> Result<f64, JsValue> {
    set_panic_hook();

    match div_internal(a, b) {
        Ok(result) => Ok(result),
        Err(msg) => Err(JsValue::from_str(msg)),
    }
}

/// 内部用の割り算関数（テスト用）
fn div_internal(a: i32, b: i32) -> Result<f64, &'static str> {
    if b == 0 {
        return Err("0で除算することはできません");
    }

    Ok(a as f64 / b as f64)
}

/// 累乗を計算します
#[wasm_bindgen]
pub fn pow(base: i32, exponent: u32) -> i32 {
    set_panic_hook();
    base.pow(exponent)
}

/// 平方根を計算します
#[wasm_bindgen]
pub fn sqrt(x: f64) -> f64 {
    set_panic_hook();
    x.sqrt()
}

// Rust側のユニットテスト
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn test_sub() {
        assert_eq!(sub(5, 3), 2);
        assert_eq!(sub(1, 5), -4);
    }

    #[test]
    fn test_mul() {
        assert_eq!(mul(3, 4), 12);
        assert_eq!(mul(-2, 3), -6);
    }

    #[test]
    fn test_div() {
        assert!((div_internal(10, 2).unwrap() - 5.0).abs() < f64::EPSILON);
        assert!((div_internal(7, 3).unwrap() - 2.3333333333333335).abs() < f64::EPSILON);
        assert!(div_internal(5, 0).is_err());
    }

    #[test]
    fn test_pow() {
        assert_eq!(pow(2, 3), 8);
        assert_eq!(pow(5, 2), 25);
    }

    #[test]
    fn test_sqrt() {
        assert!((sqrt(16.0) - 4.0).abs() < f64::EPSILON);
        assert!((sqrt(2.0) - std::f64::consts::SQRT_2).abs() < f64::EPSILON);
    }
}
