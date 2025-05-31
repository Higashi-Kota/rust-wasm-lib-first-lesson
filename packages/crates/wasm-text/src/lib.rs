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

/// 文字列を反転します
#[wasm_bindgen]
pub fn reverse(s: &str) -> String {
    set_panic_hook();
    s.chars().rev().collect()
}

/// 母音の数を数えます
#[wasm_bindgen]
pub fn count_vowels(s: &str) -> usize {
    set_panic_hook();

    let vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
    s.chars().filter(|c| vowels.contains(c)).count()
}

/// 文字列を大文字に変換します
#[wasm_bindgen]
pub fn to_uppercase(s: &str) -> String {
    set_panic_hook();
    s.to_uppercase()
}

/// 文字列を小文字に変換します
#[wasm_bindgen]
pub fn to_lowercase(s: &str) -> String {
    set_panic_hook();
    s.to_lowercase()
}

/// 文字列の文字数を返します（UTF-8対応）
#[wasm_bindgen]
pub fn char_count(s: &str) -> usize {
    set_panic_hook();
    s.chars().count()
}

/// 回文かどうかをチェックします
#[wasm_bindgen]
pub fn is_palindrome(s: &str) -> bool {
    set_panic_hook();

    let cleaned: String = s
        .chars()
        .filter(|c| c.is_alphanumeric())
        .map(|c| c.to_lowercase().next().unwrap())
        .collect();

    cleaned == cleaned.chars().rev().collect::<String>()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reverse() {
        assert_eq!(reverse("hello"), "olleh");
        assert_eq!(reverse("Rust"), "tsuR");
        assert_eq!(reverse(""), "");
    }

    #[test]
    fn test_count_vowels() {
        assert_eq!(count_vowels("hello"), 2);
        assert_eq!(count_vowels("AEIOU"), 5);
        assert_eq!(count_vowels("xyz"), 0);
        assert_eq!(count_vowels("Programming"), 3);
    }

    #[test]
    fn test_to_uppercase() {
        assert_eq!(to_uppercase("hello"), "HELLO");
        assert_eq!(to_uppercase("Rust"), "RUST");
    }

    #[test]
    fn test_to_lowercase() {
        assert_eq!(to_lowercase("HELLO"), "hello");
        assert_eq!(to_lowercase("Rust"), "rust");
    }

    #[test]
    fn test_char_count() {
        assert_eq!(char_count("hello"), 5);
        assert_eq!(char_count("こんにちは"), 5);
        assert_eq!(char_count(""), 0);
    }

    #[test]
    fn test_is_palindrome() {
        assert!(is_palindrome("racecar"));
        assert!(is_palindrome("A man a plan a canal Panama"));
        assert!(!is_palindrome("hello"));
        assert!(is_palindrome(""));
    }
}
