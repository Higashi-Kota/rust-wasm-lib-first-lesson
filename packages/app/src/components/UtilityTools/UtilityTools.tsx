import {
  fibonacci,
  gcd,
  is_even,
  is_odd,
  is_prime,
  random_between,
} from '@internal/wasm-utils'
import { useState } from 'react'

interface RandomResult {
  value: number
  range: string
  timestamp: Date
}

export function UtilityTools() {
  const [randomMin, setRandomMin] = useState<string>('1')
  const [randomMax, setRandomMax] = useState<string>('100')
  const [randomResults, setRandomResults] = useState<RandomResult[]>([])

  const [checkNumber, setCheckNumber] = useState<string>('17')
  const [numberChecks, setNumberChecks] = useState<{
    isEven: boolean
    isOdd: boolean
    isPrime: boolean
  } | null>(null)

  const [fibNumber, setFibNumber] = useState<string>('10')
  const [fibResult, setFibResult] = useState<number | null>(null)

  const [gcdA, setGcdA] = useState<string>('48')
  const [gcdB, setGcdB] = useState<string>('18')
  const [gcdResult, setGcdResult] = useState<number | null>(null)

  const [error, setError] = useState<string>('')

  const generateRandomNumber = () => {
    try {
      setError('')
      const min = Number.parseInt(randomMin)
      const max = Number.parseInt(randomMax)

      if (Number.isNaN(min) || Number.isNaN(max)) {
        throw new Error('有効な数値を入力してください')
      }

      if (min >= max) {
        throw new Error('最小値は最大値より小さくしてください')
      }

      const result = random_between(min, max)
      const newResult: RandomResult = {
        value: result,
        range: `${min}-${max}`,
        timestamp: new Date(),
      }

      setRandomResults((prev) => [newResult, ...prev.slice(0, 9)]) // 最新10件
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  const checkNumberProperties = () => {
    try {
      setError('')
      const num = Number.parseInt(checkNumber)

      if (Number.isNaN(num)) {
        throw new Error('有効な整数を入力してください')
      }

      setNumberChecks({
        isEven: is_even(num),
        isOdd: is_odd(num),
        isPrime: is_prime(num),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setNumberChecks(null)
    }
  }

  const calculateFibonacci = () => {
    try {
      setError('')
      const num = Number.parseInt(fibNumber)

      if (Number.isNaN(num) || num < 0) {
        throw new Error('0以上の整数を入力してください')
      }

      if (num > 50) {
        throw new Error('数値が大きすぎます（50以下にしてください）')
      }

      const result = fibonacci(num)
      setFibResult(Number(result))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setFibResult(null)
    }
  }

  const calculateGCD = () => {
    try {
      setError('')
      const a = Number.parseInt(gcdA)
      const b = Number.parseInt(gcdB)

      if (Number.isNaN(a) || Number.isNaN(b)) {
        throw new Error('有効な整数を入力してください')
      }

      const result = gcd(a, b)
      setGcdResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setGcdResult(null)
    }
  }

  return (
    <section className="card">
      <h3 className="flex items-center section-title">
        <span className="mr-2">🛠️</span>
        ユーティリティ (wasm-utils)
      </h3>

      <div className="space-y-8">
        {/* 乱数生成 */}
        <div>
          <h4 className="flex items-center mb-3 font-semibold text-gray-700">
            <span className="mr-2">🎲</span>
            乱数生成
          </h4>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                value={randomMin}
                onChange={(e) => setRandomMin(e.target.value)}
                className="w-20 input"
                placeholder="最小値"
              />
              <span className="text-gray-500">から</span>
              <input
                type="number"
                value={randomMax}
                onChange={(e) => setRandomMax(e.target.value)}
                className="w-20 input"
                placeholder="最大値"
              />
              <span className="text-gray-500">まで</span>
              <button
                type="button"
                onClick={generateRandomNumber}
                className="btn-primary"
              >
                生成
              </button>
            </div>

            {randomResults.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  生成履歴:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {randomResults.map((result) => (
                    <div
                      key={`${result.value}-${result.timestamp.getTime()}`}
                      className="p-2 text-center border border-blue-200 rounded bg-blue-50"
                    >
                      <div className="font-bold text-blue-800">
                        {result.value}
                      </div>
                      <div className="text-xs text-blue-600">
                        {result.range}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 数値の性質チェック */}
        <div>
          <h4 className="flex items-center mb-3 font-semibold text-gray-700">
            <span className="mr-2">🔍</span>
            数値の性質チェック
          </h4>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-32 input"
                placeholder="数値"
              />
              <button
                type="button"
                onClick={checkNumberProperties}
                className="btn-secondary"
              >
                チェック
              </button>
            </div>

            {numberChecks && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div
                  className={`p-3 rounded border text-center ${
                    numberChecks.isEven
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="font-medium">偶数</div>
                  <div className="text-lg">
                    {numberChecks.isEven ? '✅' : '❌'}
                  </div>
                </div>

                <div
                  className={`p-3 rounded border text-center ${
                    numberChecks.isOdd
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="font-medium">奇数</div>
                  <div className="text-lg">
                    {numberChecks.isOdd ? '✅' : '❌'}
                  </div>
                </div>

                <div
                  className={`p-3 rounded border text-center ${
                    numberChecks.isPrime
                      ? 'bg-purple-50 border-purple-200 text-purple-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="font-medium">素数</div>
                  <div className="text-lg">
                    {numberChecks.isPrime ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フィボナッチ数列 */}
        <div>
          <h4 className="flex items-center mb-3 font-semibold text-gray-700">
            <span className="mr-2">🌀</span>
            フィボナッチ数列
          </h4>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-600">F(</span>
              <input
                type="number"
                value={fibNumber}
                onChange={(e) => setFibNumber(e.target.value)}
                className="w-20 input"
                placeholder="n"
                min="0"
                max="50"
              />
              <span className="text-gray-600">) =</span>
              <button
                type="button"
                onClick={calculateFibonacci}
                className="btn-secondary"
              >
                計算
              </button>
            </div>

            {fibResult !== null && (
              <div className="result-display">
                <strong>
                  F({fibNumber}) = {fibResult.toLocaleString()}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* 最大公約数 */}
        <div>
          <h4 className="flex items-center mb-3 font-semibold text-gray-700">
            <span className="mr-2">🔗</span>
            最大公約数 (GCD)
          </h4>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-600">GCD(</span>
              <input
                type="number"
                value={gcdA}
                onChange={(e) => setGcdA(e.target.value)}
                className="w-20 input"
                placeholder="A"
              />
              <span className="text-gray-600">,</span>
              <input
                type="number"
                value={gcdB}
                onChange={(e) => setGcdB(e.target.value)}
                className="w-20 input"
                placeholder="B"
              />
              <span className="text-gray-600">) =</span>
              <button
                type="button"
                onClick={calculateGCD}
                className="btn-secondary"
              >
                計算
              </button>
            </div>

            {gcdResult !== null && (
              <div className="result-display">
                <strong>
                  GCD({gcdA}, {gcdB}) = {gcdResult}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="error-display">
            <strong>エラー:</strong> {error}
          </div>
        )}
      </div>
    </section>
  )
}
