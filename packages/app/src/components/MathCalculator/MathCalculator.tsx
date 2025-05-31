import { add, div, mul, pow, sqrt, sub } from '@internal/wasm-math'
import { useState } from 'react'

interface CalculationResult {
  operation: string
  result: number | string
  timestamp: Date
}

export function MathCalculator() {
  const [num1, setNum1] = useState<string>('10')
  const [num2, setNum2] = useState<string>('5')
  const [singleNum, setSingleNum] = useState<string>('16')
  const [powBase, setPowBase] = useState<string>('2')
  const [powExp, setPowExp] = useState<string>('3')
  const [results, setResults] = useState<CalculationResult[]>([])
  const [error, setError] = useState<string>('')

  const addResult = (operation: string, result: number | string) => {
    const newResult: CalculationResult = {
      operation,
      result,
      timestamp: new Date(),
    }
    setResults((prev) => [newResult, ...prev.slice(0, 4)]) // 最新5件まで保持
  }

  const handleCalculation = async (operation: string) => {
    try {
      setError('')
      const a = Number.parseInt(num1)
      const b = Number.parseInt(num2)
      let result: number | string

      if (Number.isNaN(a) || Number.isNaN(b)) {
        throw new Error('有効な数値を入力してください')
      }

      switch (operation) {
        case 'add':
          result = add(a, b)
          addResult(`${a} + ${b}`, result)
          break
        case 'sub':
          result = sub(a, b)
          addResult(`${a} - ${b}`, result)
          break
        case 'mul':
          result = mul(a, b)
          addResult(`${a} × ${b}`, result)
          break
        case 'div':
          try {
            result = await div(a, b)
            addResult(
              `${a} ÷ ${b}`,
              typeof result === 'number' ? result.toFixed(4) : result
            )
          } catch (_divError) {
            throw new Error('0で除算することはできません')
          }
          break
        default:
          throw new Error('不明な操作です')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算エラーが発生しました')
    }
  }

  const handleSqrt = () => {
    try {
      setError('')
      const num = Number.parseFloat(singleNum)
      if (Number.isNaN(num) || num < 0) {
        throw new Error('有効な非負の数値を入力してください')
      }
      const result = sqrt(num)
      addResult(`√${num}`, result.toFixed(4))
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算エラーが発生しました')
    }
  }

  const handlePow = () => {
    try {
      setError('')
      const base = Number.parseInt(powBase)
      const exp = Number.parseInt(powExp)
      if (Number.isNaN(base) || Number.isNaN(exp) || exp < 0) {
        throw new Error('有効な数値を入力してください（指数は非負の整数）')
      }
      const result = pow(base, exp)
      addResult(`${base}^${exp}`, result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算エラーが発生しました')
    }
  }

  return (
    <section className="card">
      <h3 className="flex items-center section-title">
        <span className="mr-2">🧮</span>
        数学計算 (wasm-math)
      </h3>

      <div className="space-y-6">
        {/* 基本四則演算 */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-700">基本四則演算</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="number"
              value={num1}
              onChange={(e) => setNum1(e.target.value)}
              className="w-20 input"
              placeholder="数値1"
            />
            <span className="flex items-center text-gray-500">と</span>
            <input
              type="number"
              value={num2}
              onChange={(e) => setNum2(e.target.value)}
              className="w-20 input"
              placeholder="数値2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCalculation('add')}
              className="btn-primary"
            >
              足し算 (+)
            </button>
            <button
              type="button"
              onClick={() => handleCalculation('sub')}
              className="btn-primary"
            >
              引き算 (-)
            </button>
            <button
              type="button"
              onClick={() => handleCalculation('mul')}
              className="btn-primary"
            >
              掛け算 (×)
            </button>
            <button
              type="button"
              onClick={() => handleCalculation('div')}
              className="btn-primary"
            >
              割り算 (÷)
            </button>
          </div>
        </div>

        {/* 平方根 */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-700">平方根</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="number"
              value={singleNum}
              onChange={(e) => setSingleNum(e.target.value)}
              className="w-32 input"
              placeholder="数値"
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={handleSqrt}
              className="btn-secondary"
            >
              √ 平方根
            </button>
          </div>
        </div>

        {/* 累乗 */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-700">累乗</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="number"
              value={powBase}
              onChange={(e) => setPowBase(e.target.value)}
              className="w-20 input"
              placeholder="底"
            />
            <span className="flex items-center text-gray-500">の</span>
            <input
              type="number"
              value={powExp}
              onChange={(e) => setPowExp(e.target.value)}
              className="w-20 input"
              placeholder="指数"
              min="0"
            />
            <span className="flex items-center text-gray-500">乗</span>
            <button type="button" onClick={handlePow} className="btn-secondary">
              計算
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="error-display">
            <strong>エラー:</strong> {error}
          </div>
        )}

        {/* 計算結果履歴 */}
        {results.length > 0 && (
          <div>
            <h4 className="mb-3 font-semibold text-gray-700">計算結果</h4>
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.timestamp.getTime()}
                  className="result-display"
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>{result.operation}</strong> = {result.result}
                    </span>
                    <span className="text-xs text-green-600">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
