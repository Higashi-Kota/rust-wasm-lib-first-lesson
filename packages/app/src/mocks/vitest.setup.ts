// Vitestのテスト環境設定
import { vi } from 'vitest'

// WASMモジュールのモック（テスト時に使用）
vi.mock('@internal/wasm-math', () => ({
  default: vi.fn().mockResolvedValue(undefined), // init関数のモック
  add: vi.fn((a: number, b: number) => a + b),
  sub: vi.fn((a: number, b: number) => a - b),
  mul: vi.fn((a: number, b: number) => a * b),
  div: vi.fn((a: number, b: number) => {
    if (b === 0) throw new Error('0で除算することはできません')
    return a / b
  }),
  pow: vi.fn((base: number, exp: number) => base ** exp),
  sqrt: vi.fn((x: number) => Math.sqrt(x)),
}))

vi.mock('@internal/wasm-text', () => ({
  default: vi.fn().mockResolvedValue(undefined), // init関数のモック
  reverse: vi.fn((s: string) => s.split('').reverse().join('')),
  count_vowels: vi.fn((s: string) => {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']
    return s.split('').filter((c) => vowels.includes(c)).length
  }),
  to_uppercase: vi.fn((s: string) => s.toUpperCase()),
  to_lowercase: vi.fn((s: string) => s.toLowerCase()),
  char_count: vi.fn((s: string) => s.length),
  is_palindrome: vi.fn((s: string) => {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '')
    return cleaned === cleaned.split('').reverse().join('')
  }),
}))

vi.mock('@internal/wasm-utils', () => ({
  default: vi.fn().mockResolvedValue(undefined), // init関数のモック
  random_between: vi.fn((min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min
  }),
  is_even: vi.fn((n: number) => n % 2 === 0),
  is_odd: vi.fn((n: number) => n % 2 !== 0),
  is_prime: vi.fn((n: number) => {
    if (n < 2) return false
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false
    }
    return true
  }),
  fibonacci: vi.fn((n: number) => {
    if (n <= 1) return n
    let prev = 0
    let curr = 1
    for (let i = 2; i <= n; i++) {
      ;[prev, curr] = [curr, prev + curr]
    }
    return curr
  }),
  gcd: vi.fn((a: number, b: number) => {
    let absA = Math.abs(a)
    let absB = Math.abs(b)
    while (absB !== 0) {
      ;[absA, absB] = [absB, absA % absB]
    }
    return absA
  }),
}))
