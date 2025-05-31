import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    // テスト環境をjsdomに設定
    environment: 'jsdom',

    setupFiles: ['./src/mocks/vitest.setup.ts'],

    // グローバルなテスト関数を有効化（describe, it, expect など）
    globals: true,

    // テストファイルのパターン（.tsx/.jsx を追加）
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}', 
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}', 
        'src/index.ts',
        'src/main.tsx',
        'src/mocks/**'
      ],
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // TypeScript設定
  esbuild: {
    target: 'node22',
  },
})