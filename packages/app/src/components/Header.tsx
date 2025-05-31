export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-lg font-bold text-white">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Rust WASM Demo
              </h1>
              <p className="text-sm text-gray-500">
                高性能なWebアプリケーション
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="items-center hidden space-x-2 text-sm text-gray-500 sm:flex">
              <span className="inline-flex items-center px-2 py-1 text-orange-800 bg-orange-100 rounded-full">
                🦀 Rust
              </span>
              <span className="inline-flex items-center px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                ⚛️ React
              </span>
              <span className="inline-flex items-center px-2 py-1 text-purple-800 bg-purple-100 rounded-full">
                🚀 WASM
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
