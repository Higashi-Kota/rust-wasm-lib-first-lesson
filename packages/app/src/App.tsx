import { BenchmarkDemo } from '@/components/BenchmarkDemo'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container px-4 py-8 mx-auto">
        <div className="space-y-8">
          {/* 説明セクション */}
          <section className="text-center animate-fade-in">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              🦀 GNRNG-ID Demo
            </h2>
            <p className="max-w-4xl mx-auto text-lg text-gray-600">
              Rustで実装された高性能なGNRNG（Good Night Random Number
              Generator）とID生成ユーティリティの
              WebAssemblyデモンストレーションです。決定的な乱数生成とユニークなID作成を体験できます。
            </p>

            {/* パッケージ情報 */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <a
                href="https://www.npmjs.com/package/@nap5/gnrng-id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                📦 npm
              </a>
              <a
                href="https://jsr.io/@nap5/gnrng-id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-yellow-600 rounded-lg hover:bg-yellow-700"
              >
                🦕 JSR
              </a>
              <a
                href="https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-900"
              >
                🔗 GitHub
              </a>
            </div>
          </section>

          {/* デモセクション */}
          <div className="grid gap-8 grid-auto-fit">
            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <BenchmarkDemo />
            </div>
          </div>

          {/* 技術情報セクション */}
          <section
            className="card animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <h3 className="section-title">🚀 技術スタック</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  🦀 Backend (WASM)
                </h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Rust 1.86.0 + wasm-bindgen</li>
                  <li>• wasm-pack (ビルドツール)</li>
                  <li>• GNRNG疑似乱数生成器</li>
                  <li>• 高性能ID生成アルゴリズム</li>
                  <li>• メモリ効率的な実装</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">⚛️ Frontend</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• React 18 + TypeScript</li>
                  <li>• Vite (高速ビルドツール)</li>
                  <li>• TailwindCSS (スタイリング)</li>
                  <li>• Vitest (テストフレームワーク)</li>
                  <li>• Biome (リンター・フォーマッター)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* パフォーマンス情報セクション */}
          <section
            className="card animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <h3 className="section-title">⚡ パフォーマンス</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-800">5.6x</div>
                <div className="text-sm text-green-600">GNRNG生成速度向上</div>
                <div className="mt-1 text-xs text-gray-500">
                  vs. TypeScript実装
                </div>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-800">4x</div>
                <div className="text-sm text-blue-600">ID生成速度向上</div>
                <div className="mt-1 text-xs text-gray-500">
                  vs. JavaScript実装
                </div>
              </div>
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-800">100%</div>
                <div className="text-sm text-purple-600">決定性保証</div>
                <div className="mt-1 text-xs text-gray-500">
                  同一シード・同一結果
                </div>
              </div>
            </div>
          </section>

          {/* 使用例セクション */}
          <section
            className="card animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <h3 className="section-title">💻 使用例</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="mb-2 font-medium text-gray-900">インストール</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <code className="block p-2 text-sm text-green-400 bg-black rounded">
                    npm install @nap5/gnrng-id
                  </code>
                  <code className="block p-2 text-sm text-green-400 bg-black rounded">
                    deno add @nap5/gnrng-id
                  </code>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="mb-2 font-medium text-gray-900">
                  基本的な使用方法
                </h4>
                <pre className="p-3 overflow-x-auto text-sm text-gray-300 bg-black rounded">
                  {`import { initWasm, createId, createIdBySeed } from '@nap5/gnrng-id'

await initWasm()

const randomId = createId()  // "t_A7Bp9X2"
const seededId = createIdBySeed('my-seed')  // 決定的なID`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
