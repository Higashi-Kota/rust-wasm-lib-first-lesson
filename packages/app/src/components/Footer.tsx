export function Footer() {
  return (
    <footer className="mt-16 text-gray-300 bg-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {/* プロジェクト情報 */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Rust WASM + React Demo
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              現代的なWebアプリケーションの構築に向けた、
              RustのWebAssemblyとReactの統合デモンストレーションです。
            </p>
          </div>

          {/* 技術スタック */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              技術スタック
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-orange-500 rounded-full" />
                <span>Rust + WebAssembly</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full" />
                <span>React + TypeScript</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-green-500 rounded-full" />
                <span>Vite + TailwindCSS</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-purple-500 rounded-full" />
                <span>PNPM + Cargo Workspace</span>
              </div>
            </div>
          </div>

          {/* パフォーマンス情報 */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">特徴</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div>⚡ 高速なWASM計算処理</div>
              <div>🔄 ホットリロード対応</div>
              <div>📱 レスポンシブデザイン</div>
              <div>🧪 包括的なテストカバレッジ</div>
              <div>🛠️ 型安全なAPI</div>
            </div>
          </div>
        </div>

        {/* 著作権とリンク */}
        <div className="pt-6 mt-8 border-t border-gray-700">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="text-sm text-gray-400">
              © 2024 Rust WASM React Demo. Built with ❤️ and ☕
            </div>

            <div className="flex items-center mt-4 space-x-4 sm:mt-0">
              <a
                href="https://github.com"
                className="text-sm text-gray-400 transition-colors hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://doc.rust-lang.org/"
                className="text-sm text-gray-400 transition-colors hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Rust Docs
              </a>
              <a
                href="https://react.dev/"
                className="text-sm text-gray-400 transition-colors hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                React Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
