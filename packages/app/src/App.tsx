import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { MathCalculator } from '@/components/MathCalculator'
import { TextProcessor } from '@/components/TextProcessor'
import { UtilityTools } from '@/components/UtilityTools'

import { createIdBySeed } from '@internal/utils'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container px-4 py-8 mx-auto">
        <div className="space-y-8">
          {/* 説明セクション */}
          <section className="text-center animate-fade-in">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Rust WASM × React デモ{createIdBySeed('Hey')}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">
              Rustで書かれた高速な処理をWebAssembly（WASM）としてブラウザで実行し、
              Reactの美しいUIと組み合わせたモダンなWebアプリケーションです。
            </p>
          </section>

          {/* デモセクション */}
          <div className="grid gap-8 grid-auto-fit">
            <div className="animate-slide-up">
              <MathCalculator />
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <TextProcessor />
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <UtilityTools />
            </div>
          </div>

          {/* 技術情報セクション */}
          <section
            className="card animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <h3 className="section-title">使用技術</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  フロントエンド
                </h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• React 18 + TypeScript</li>
                  <li>• Vite (高速ビルドツール)</li>
                  <li>• TailwindCSS (スタイリング)</li>
                  <li>• Vitest (テストフレームワーク)</li>
                  <li>• Biome (リンター・フォーマッター)</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  バックエンド (WASM)
                </h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Rust + wasm-bindgen</li>
                  <li>• wasm-pack (ビルドツール)</li>
                  <li>• Cargo workspace (プロジェクト管理)</li>
                  <li>• PNPM workspace (パッケージ管理)</li>
                  <li>• ホットリロード対応</li>
                </ul>
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
