import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UtilityTools } from './UtilityTools'

// WASMモジュールのモック
vi.mock('@internal/wasm-utils', async () => {
  const actualModule = await vi.importActual('@internal/wasm-utils')
  return {
    ...actualModule,
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
      let a = 0
      let b = 1
      for (let i = 2; i <= n; i++) {
        ;[a, b] = [b, a + b]
      }
      return b
    }),
    gcd: vi.fn((a: number, b: number) => {
      let absA = Math.abs(a)
      let absB = Math.abs(b)
      while (absB !== 0) {
        ;[absA, absB] = [absB, absA % absB]
      }
      return absA
    }),
  }
})

describe('UtilityTools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('コンポーネントが正しくレンダリングされる', () => {
    render(<UtilityTools />)

    expect(screen.getByText('ユーティリティ (wasm-utils)')).toBeTruthy()
    expect(screen.getByText('乱数生成')).toBeTruthy()
    expect(screen.getByText('数値の性質チェック')).toBeTruthy()
    expect(screen.getByText('フィボナッチ数列')).toBeTruthy()
    expect(screen.getByText('最大公約数 (GCD)')).toBeTruthy()
  })

  it('乱数生成が正しく動作する', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 乱数範囲を設定
    const minInput = screen.getByDisplayValue('1')
    const maxInput = screen.getByDisplayValue('100')

    await user.clear(minInput)
    await user.type(minInput, '10')
    await user.clear(maxInput)
    await user.type(maxInput, '20')

    // 生成ボタンをクリック
    const generateButton = screen.getByText('生成')
    await user.click(generateButton)

    // 生成履歴が表示されることを確認
    await waitFor(
      () => {
        expect(screen.getByText('生成履歴:')).toBeTruthy()
        expect(screen.getByText('10-20')).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('乱数生成で無効な範囲を入力するとエラーが表示される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 無効な範囲を設定（最小値 > 最大値）
    const minInput = screen.getByDisplayValue('1')
    const maxInput = screen.getByDisplayValue('100')

    await user.clear(minInput)
    await user.type(minInput, '50')
    await user.clear(maxInput)
    await user.type(maxInput, '30')

    // 生成ボタンをクリック
    const generateButton = screen.getByText('生成')
    await user.click(generateButton)

    // エラーメッセージが表示されることを確認
    await waitFor(
      () => {
        expect(
          screen.getByText(/最小値は最大値より小さくしてください/)
        ).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('数値の性質チェックが正しく動作する', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 偶数をテスト
    const checkInput = screen.getByDisplayValue('17')
    await user.clear(checkInput)
    await user.type(checkInput, '8')

    const checkButton = screen.getByText('チェック')
    await user.click(checkButton)

    await waitFor(
      () => {
        const evenCells = screen.getAllByText('✅')
        const oddCells = screen.getAllByText('❌')

        // 8は偶数なので、偶数にチェック、奇数にX、素数にXが入るはず
        expect(evenCells.length).toBeGreaterThan(0)
        expect(oddCells.length).toBeGreaterThan(0)
      },
      { timeout: 1000 }
    )
  })

  it('素数が正しく判定される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 素数をテスト
    const checkInput = screen.getByDisplayValue('17')
    await user.clear(checkInput)
    await user.type(checkInput, '7')

    const checkButton = screen.getByText('チェック')
    await user.click(checkButton)

    await waitFor(
      () => {
        // 7は奇数かつ素数
        const checkResults = screen.getAllByText('✅')
        expect(checkResults.length).toBe(2) // 奇数と素数でチェックマーク
      },
      { timeout: 1000 }
    )
  })

  it('フィボナッチ数列が正しく計算される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // フィボナッチ数を計算
    const fibInput = screen.getByDisplayValue('10')
    await user.clear(fibInput)
    await user.type(fibInput, '5')

    const fibButton = screen.getAllByText('計算')[0] // フィボナッチ用の計算ボタン（最初の方）
    await user.click(fibButton)

    await waitFor(
      () => {
        expect(screen.getByText(/F\(5\) = 5/)).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('フィボナッチ数列で大きすぎる値を入力するとエラーが表示される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 大きすぎる値を入力
    const fibInput = screen.getByDisplayValue('10')
    await user.clear(fibInput)
    await user.type(fibInput, '100')

    const fibButton = screen.getAllByText('計算')[0] // フィボナッチ用の計算ボタン（最初の方）
    await user.click(fibButton)

    await waitFor(
      () => {
        expect(screen.getByText(/数値が大きすぎます/)).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('最大公約数が正しく計算される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // GCDを計算
    const gcdAInput = screen.getByDisplayValue('48')
    const gcdBInput = screen.getByDisplayValue('18')

    await user.clear(gcdAInput)
    await user.type(gcdAInput, '12')
    await user.clear(gcdBInput)
    await user.type(gcdBInput, '8')

    const gcdButton = screen.getAllByText('計算')[1] // 2番目の計算ボタン（GCD用）
    await user.click(gcdButton)

    await waitFor(
      () => {
        expect(screen.getByText(/GCD\(12, 8\) = 4/)).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('無効な数値入力でエラーが表示される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 無効な値を入力
    const checkInput = screen.getByDisplayValue('17')
    await user.clear(checkInput)
    await user.type(checkInput, 'abc')

    const checkButton = screen.getByText('チェック')
    await user.click(checkButton)

    await waitFor(
      () => {
        expect(screen.getByText(/有効な整数を入力してください/)).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('負の値をフィボナッチ入力するとエラーが表示される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    // 負の値を入力
    const fibInput = screen.getByDisplayValue('10')
    await user.clear(fibInput)
    await user.type(fibInput, '-5')

    const fibButton = screen.getAllByText('計算')[0] // フィボナッチ用の計算ボタン（最初の方）
    await user.click(fibButton)

    await waitFor(
      () => {
        expect(screen.getByText(/0以上の整数を入力してください/)).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('複数回の乱数生成で履歴が正しく表示される', async () => {
    const user = userEvent.setup()
    render(<UtilityTools />)

    const generateButton = screen.getByText('生成')

    // 複数回生成
    await user.click(generateButton)
    await user.click(generateButton)
    await user.click(generateButton)

    await waitFor(
      () => {
        expect(screen.getByText('生成履歴:')).toBeTruthy()
        // 複数の結果が表示されることを確認
        const historyItems = screen.getAllByText('1-100')
        expect(historyItems.length).toBe(3)
      },
      { timeout: 1000 }
    )
  })
})
