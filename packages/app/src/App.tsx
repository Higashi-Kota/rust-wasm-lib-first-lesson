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
