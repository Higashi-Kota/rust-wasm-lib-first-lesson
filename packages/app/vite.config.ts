import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // 開発時は utils のソースを直接参照
      '@internal/utils': resolve(__dirname, '../utils/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['lucide-react', '@internal/utils'],
  },
   // ビルド設定
  build: {
    target: 'esnext',
    rollupOptions: {
      // WASMファイルを静的アセットとして扱う
      external: [],
    }
  },
  // WASM関連の設定
  server: {
    fs: {
      // WASMファイルへのアクセスを許可
      allow: ['..', '../..']
    },
    // WASMクレートのpkgディレクトリを監視してホットリロード
    watch: {
      ignored: ['!**/packages/crates/**/pkg/**']
    }
  },
})
