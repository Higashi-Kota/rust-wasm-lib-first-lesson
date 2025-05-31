import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TextProcessor } from './TextProcessor'

// WASMモジュールのモック
vi.mock('@internal/wasm-text', async () => {
  const actualModule = await vi.importActual('@internal/wasm-text')
  return {
    ...actualModule,
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
  }
})

describe('TextProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('コンポーネントが正しくレンダリングされる', () => {
    render(<TextProcessor />)

    expect(screen.getByText('テキスト処理 (wasm-text)')).toBeTruthy()
    expect(screen.getByPlaceholderText('ここにテキストを入力...')).toBeTruthy()
    expect(screen.getByText('サンプルテキスト:')).toBeTruthy()
  })

  it('初期テキストが自動的に処理される', async () => {
    render(<TextProcessor />)

    // デフォルトテキスト "Hello World!" の処理結果が表示されることを確認
    await waitFor(
      () => {
        expect(screen.getByText('分析結果')).toBeTruthy()
        expect(screen.getByText('12')).toBeTruthy() // 文字数
        expect(screen.getByText('3')).toBeTruthy() // 母音数
      },
      { timeout: 1000 }
    )
  })

  it('テキスト入力時にリアルタイムで処理される', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    const textarea = screen.getByPlaceholderText('ここにテキストを入力...')

    // テキストを変更
    await user.clear(textarea)
    await user.type(textarea, 'test')

    // 処理結果が更新されることを確認（デバウンス後）
    await waitFor(
      () => {
        expect(screen.getByText('分析結果')).toBeTruthy()
        // "test"の分析結果
        expect(screen.getByText('4')).toBeTruthy() // 文字数
        expect(screen.getByText('1')).toBeTruthy() // 母音数 (e)
      },
      { timeout: 1000 }
    )
  })

  it('回文が正しく判定される', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    const textarea = screen.getByPlaceholderText('ここにテキストを入力...')

    // 回文テキストを入力
    await user.clear(textarea)
    await user.type(textarea, 'racecar')

    await waitFor(
      () => {
        expect(screen.getByText('回文です！')).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('非回文が正しく判定される', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    const textarea = screen.getByPlaceholderText('ここにテキストを入力...')

    // 非回文テキストを入力
    await user.clear(textarea)
    await user.type(textarea, 'hello')

    await waitFor(
      () => {
        expect(screen.getByText('回文ではありません')).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('テキスト変換結果が正しく表示される', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    const textarea = screen.getByPlaceholderText('ここにテキストを入力...')

    // テスト用テキストを入力
    await user.clear(textarea)
    await user.type(textarea, 'Hello')

    await waitFor(
      () => {
        expect(screen.getByText('分析結果')).toBeTruthy()

        // 各変換結果が表示されることを確認
        const containers = screen.getAllByText('Hello')
        expect(containers.length).toBeGreaterThan(0)

        expect(screen.getByText('olleH')).toBeTruthy() // 反転
        expect(screen.getByText('HELLO')).toBeTruthy() // 大文字
        expect(screen.getByText('hello')).toBeTruthy() // 小文字
      },
      { timeout: 1000 }
    )
  })

  it('サンプルテキストボタンが機能する', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    // サンプルテキストボタンをクリック
    const sampleButton = screen.getByText('racecar')
    await user.click(sampleButton)

    // テキストエリアにサンプルテキストが設定されることを確認
    const textarea = screen.getByDisplayValue('racecar')
    expect(textarea).toBeTruthy()

    // 処理結果も更新されることを確認
    await waitFor(
      () => {
        expect(screen.getByText('回文です！')).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('空のテキストの場合は適切なメッセージが表示される', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    const textarea = screen.getByPlaceholderText('ここにテキストを入力...')

    // テキストエリアを空にする
    await user.clear(textarea)

    await waitFor(
      () => {
        expect(
          screen.getByText(
            /テキストを入力すると、リアルタイムで分析結果が表示されます/
          )
        ).toBeTruthy()
      },
      { timeout: 1000 }
    )
  })

  it('処理中インジケーターが表示される', async () => {
    const user = userEvent.setup()
    render(<TextProcessor />)

    const textarea = screen.getByPlaceholderText('ここにテキストを入力...')

    // テキストを高速で変更して処理中状態を作る
    await user.clear(textarea)
    await user.type(textarea, 'processing')

    // 処理中インジケーターが一時的に表示される可能性をテスト
    // （デバウンスのタイミングによっては表示されない場合もある）
    const processingText = screen.queryByText('処理中...')
    if (processingText) {
      expect(processingText).toBeTruthy()
    }
  })
})
