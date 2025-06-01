export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* ロゴとアイコン */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500">
              <span className="text-2xl font-bold text-white">🦀</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                @nap5/gnrng-id
              </h1>
              <p className="text-sm text-gray-500">
                Rust WASM × TypeScript ID Generator
              </p>
            </div>
          </div>

          {/* 技術バッジとリンク */}
          <div className="flex items-center space-x-4">
            {/* 技術スタックバッジ */}
            <div className="items-center hidden space-x-2 text-sm sm:flex">
              <span className="inline-flex items-center px-3 py-1 text-orange-800 bg-orange-100 rounded-full">
                <span className="mr-1">🦀</span>
                Rust
              </span>
              <span className="inline-flex items-center px-3 py-1 text-blue-800 bg-blue-100 rounded-full">
                <span className="mr-1">🚀</span>
                WASM
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-cyan-800 bg-cyan-100">
                <span className="mr-1">⚛️</span>
                React
              </span>
            </div>

            {/* 外部リンク */}
            <div className="flex items-center space-x-2">
              <a
                href="https://www.npmjs.com/package/@nap5/gnrng-id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                title="View on npm"
              >
                <span className="mr-1">📦</span>
                <span className="hidden sm:inline">npm</span>
              </a>
              <a
                href="https://github.com/Higashi-Kota/rust-wasm-lib-first-lesson"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-900"
                title="View on GitHub"
              >
                <span className="mr-1">🔗</span>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* サブヘッダー */}
        <div className="mt-4">
          <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
            <p className="text-gray-600">
              高性能な決定的乱数生成とID作成ユーティリティ
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
