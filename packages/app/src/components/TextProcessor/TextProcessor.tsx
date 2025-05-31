import {
  char_count,
  count_vowels,
  is_palindrome,
  reverse,
  to_lowercase,
  to_uppercase,
} from '@internal/wasm-text'
import { useCallback, useEffect, useState } from 'react'

interface TextAnalysis {
  original: string
  reversed: string
  uppercase: string
  lowercase: string
  charCount: number
  vowelCount: number
  isPalindrome: boolean
}

export function TextProcessor() {
  const [inputText, setInputText] = useState<string>('Hello World!')
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const processText = useCallback(async () => {
    if (!inputText.trim()) {
      setAnalysis(null)
      return
    }

    setIsProcessing(true)
    try {
      // WASM関数を並列実行して高速化
      const [
        reversedText,
        uppercaseText,
        lowercaseText,
        charCountResult,
        vowelCountResult,
        palindromeResult,
      ] = await Promise.all([
        Promise.resolve(reverse(inputText)),
        Promise.resolve(to_uppercase(inputText)),
        Promise.resolve(to_lowercase(inputText)),
        Promise.resolve(char_count(inputText)),
        Promise.resolve(count_vowels(inputText)),
        Promise.resolve(is_palindrome(inputText)),
      ])

      setAnalysis({
        original: inputText,
        reversed: reversedText,
        uppercase: uppercaseText,
        lowercase: lowercaseText,
        charCount: charCountResult,
        vowelCount: vowelCountResult,
        isPalindrome: palindromeResult,
      })
    } catch (error) {
      console.error('Text processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [inputText])

  // リアルタイム処理（デバウンス付き）
  useEffect(() => {
    const timer = setTimeout(() => {
      processText()
    }, 300) // 300ms後に処理実行

    return () => clearTimeout(timer)
  }, [processText])

  const exampleTexts = [
    'Hello World!',
    'racecar',
    'A man a plan a canal Panama',
    'TypeScript',
    'こんにちは世界',
    'Rust WebAssembly',
  ]

  return (
    <section className="card">
      <h3 className="flex items-center section-title">
        <span className="mr-2">📝</span>
        テキスト処理 (wasm-text)
      </h3>

      <div className="space-y-6">
        {/* 入力エリア */}
        <div>
          <label
            htmlFor="text-input"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            処理するテキストを入力してください
          </label>
          <textarea
            id="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-24 resize-none input"
            placeholder="ここにテキストを入力..."
          />

          {/* サンプルテキスト */}
          <div className="mt-3">
            <p className="mb-2 text-sm text-gray-500">サンプルテキスト:</p>
            <div className="flex flex-wrap gap-2">
              {exampleTexts.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setInputText(text)}
                  className="px-2 py-1 text-xs transition-colors bg-gray-100 rounded hover:bg-gray-200"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 処理中表示 */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin" />
            <span className="ml-2 text-gray-600">処理中...</span>
          </div>
        )}

        {/* 分析結果 */}
        {analysis && !isProcessing && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">分析結果</h4>

            <div className="grid gap-4">
              {/* 基本情報 */}
              <div className="result-display">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="font-medium">文字数:</span>{' '}
                    {analysis.charCount}
                  </div>
                  <div>
                    <span className="font-medium">母音数:</span>{' '}
                    {analysis.vowelCount}
                  </div>
                </div>
              </div>

              {/* 回文判定 */}
              <div
                className={`border rounded-lg p-4 ${
                  analysis.isPalindrome
                    ? 'bg-purple-50 border-purple-200 text-purple-800'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">
                    {analysis.isPalindrome ? '🔄' : '📝'}
                  </span>
                  <span className="font-medium">
                    {analysis.isPalindrome
                      ? '回文です！'
                      : '回文ではありません'}
                  </span>
                </div>
              </div>

              {/* テキスト変換結果 */}
              <div className="space-y-3">
                <div>
                  <div className="block mb-1 text-sm font-medium text-gray-700">
                    元のテキスト:
                  </div>
                  <div className="p-3 font-mono text-sm border rounded bg-gray-50">
                    {analysis.original}
                  </div>
                </div>

                <div>
                  <div className="block mb-1 text-sm font-medium text-gray-700">
                    反転:
                  </div>
                  <div className="p-3 font-mono text-sm border rounded bg-blue-50">
                    {analysis.reversed}
                  </div>
                </div>

                <div>
                  <div className="block mb-1 text-sm font-medium text-gray-700">
                    大文字:
                  </div>
                  <div className="p-3 font-mono text-sm border rounded bg-green-50">
                    {analysis.uppercase}
                  </div>
                </div>

                <div>
                  <div className="block mb-1 text-sm font-medium text-gray-700">
                    小文字:
                  </div>
                  <div className="p-3 font-mono text-sm border rounded bg-yellow-50">
                    {analysis.lowercase}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 空のメッセージ */}
        {!analysis && !isProcessing && !inputText.trim() && (
          <div className="py-8 text-center text-gray-500">
            テキストを入力すると、リアルタイムで分析結果が表示されます
          </div>
        )}
      </div>
    </section>
  )
}
