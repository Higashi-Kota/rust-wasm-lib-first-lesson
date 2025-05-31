export function Footer() {
  return (
    <footer className="mt-16 text-gray-300 bg-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          {/* ライブラリ情報 */}
          <div>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <span className="text-lg font-bold text-white">🦀</span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                @nap5/gnrng-id
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Rust WebAssemblyで実装された高性能なGNRNG（Good Night Random
              Number Generator）と ID生成ユーティリティライブラリです。
            </p>
          </div>

          {/* インストール */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              📦 インストール
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <div className="mb-1 text-gray-300">npm:</div>
                <code className="block p-2 text-xs text-green-400 bg-black rounded">
                  npm install @nap5/gnrng-id
                </code>
              </div>
              <div>
                <div className="mb-1 text-gray-300">JSR (Deno):</div>
                <code className="block p-2 text-xs text-green-400 bg-black rounded">
                  deno add @nap5/gnrng-id
                </code>
              </div>
            </div>
          </div>

          {/* 技術スタック */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              🛠️ 技術スタック
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-orange-500 rounded-full" />
                <span>Rust 1.86.0</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full" />
                <span>WebAssembly (wasm-bindgen)</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 rounded-full bg-cyan-500" />
                <span>TypeScript</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-green-500 rounded-full" />
                <span>React + Vite</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-purple-500 rounded-full" />
                <span>pnpm + Cargo Workspace</span>
              </div>
            </div>
          </div>

          {/* パフォーマンス & 特徴 */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              ⚡ パフォーマンス
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <span className="mr-2 text-green-400">🚀</span>
                <span>5.6x faster GNRNG generation</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-blue-400">⚡</span>
                <span>4x faster ID creation</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-purple-400">🔒</span>
                <span>100% deterministic results</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-yellow-400">📦</span>
                <span>Type-safe API</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-pink-400">🌐</span>
                <span>Universal (Node.js/Deno/Browser)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 下部セクション */}
        <div className="pt-6 mt-8 border-t border-gray-700">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            {/* 著作権情報 */}
            <div className="text-center sm:text-left">
              <div className="text-sm text-gray-400">
                © 2024{' '}
                <span className="font-medium text-white">@nap5/gnrng-id</span>
              </div>
              <div className="text-xs text-gray-500">
                Made with ❤️ by{' '}
                <a
                  href="https://github.com/Higashi-Kota"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Higashi Kota
                </a>
              </div>
            </div>

            {/* ライセンスとリンク */}
            <div className="flex flex-col items-center space-y-2 sm:items-end">
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/@nap5/gnrng-id"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  npm Package
                </a>
                <a
                  href="https://jsr.io/@nap5/gnrng-id"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  JSR Package
                </a>
                <a
                  href="https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson/blob/main/LICENSE"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MIT License
                </a>
              </div>

              {/* バージョン情報 */}
              <div className="text-xs text-gray-500">
                v0.1.0 • Built with Rust {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>

        {/* クイックスタート */}
        <div className="p-4 mt-6 bg-gray-800 border border-gray-700 rounded-lg">
          <h5 className="mb-2 text-sm font-medium text-white">
            🚀 Quick Start
          </h5>
          <pre className="overflow-x-auto text-xs text-gray-300">
            {`import { initWasm, createId, createIdBySeed } from '@nap5/gnrng-id'

await initWasm()
const randomId = createId()          // "t_A7Bp9X2"
const seededId = createIdBySeed('my-seed')  // deterministic`}
          </pre>
        </div>
      </div>
    </footer>
  )
}
