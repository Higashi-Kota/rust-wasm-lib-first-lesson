import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // テスト環境をNodeに設定（WASMテスト用）
    environment: 'node',

    // セットアップファイルを追加
    setupFiles: ['./src/test-setup.ts'],

    // グローバルなテスト関数を有効化（describe, it, expect など）
    globals: true,

    // テストファイルのパターン
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],

    // ベンチマークファイルのパターン
    benchmark: {
      include: ['src/**/*.{bench,benchmark}.{js,ts}'],
      exclude: ['node_modules', 'dist'],
    },

    // テストタイムアウト設定（WASMロードを考慮）
    testTimeout: 30000,
    hookTimeout: 30000,

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.bench.ts',
        'src/**/*.benchmark.ts',
        'src/index.ts',
        'dist/**',
        'node_modules/**',
      ],
      // WASM関連のカバレッジしきい値
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // パフォーマンステスト設定
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // WASMの安定性のため単一プロセス
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@internal/utils': resolve(__dirname, '../utils/src/index.ts'),
      '@nap5/gnrng-id-wasm': resolve(__dirname, '../crates/gnrng-id/pkg'),
    },
  },

  // TypeScript設定
  esbuild: {
    target: 'node18',
  },

  // 依存関係の最適化
  optimizeDeps: {
    exclude: ['@nap5/gnrng-id-wasm'],
  },

  // WASM対応のためのサーバー設定
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
})
