# 開発用のスコープ名（お好みで変更可能）
SCOPE = nap5

# WASMクレートのビルド（開発用）
build-wasm-dev:
	@echo "Building GNRNG-ID WASM package for development..."
	wasm-pack build packages/crates/gnrng-id --target web --scope $(SCOPE) --dev
	@echo "GNRNG-ID WASM package built successfully!"

# WASMクレートのビルド（本番用）
build-wasm-prod:
	@echo "Building GNRNG-ID WASM package for production..."
	wasm-pack build packages/crates/gnrng-id --target web --scope $(SCOPE) --release
	@echo "GNRNG-ID WASM package built successfully!"

# 依存関係のインストール（改善版）
install:
	@echo "Installing dependencies..."
	pnpm install --shamefully-hoist
	@echo "Dependencies installed successfully!"

# 完全セットアップ（推奨）
setup:
	@echo "Setting up entire project..."
	make clean
	make build-wasm-dev
	pnpm install --shamefully-hoist
	make build-lib
	@echo "Project setup completed successfully!"

# クイックセットアップ
setup-quick:
	@echo "Quick setup..."
	make build-wasm-dev
	pnpm install
	@echo "Quick setup completed!"

# 開発サーバーの起動（要concurrently）
dev:
	@echo "Starting development servers..."
	pnpm run dev

# ライブラリのビルド
build-lib:
	@echo "Building TypeScript library..."
	pnpm --filter @nap5/gnrng-id build
	@echo "Library built successfully!"

# 全体のビルド
build:
	@echo "Building entire project..."
	make build-wasm-prod
	make build-lib
	pnpm --filter app build
	@echo "Build completed successfully!"

# WASMクレートの監視ビルド（開発用）
watch-wasm:
	@echo "Starting WASM watch mode..."
	cargo watch -w packages/crates/gnrng-id -s "make build-wasm-dev"

# ライブラリの監視ビルド（開発用）
watch-lib:
	@echo "Starting library watch mode..."
	pnpm --filter @nap5/gnrng-id dev

# 開発モード（全監視）
dev-all:
	@echo "Starting full development mode..."
	concurrently \
		"make watch-wasm" \
		"make watch-lib" \
		"pnpm --filter app dev" \
		--names "wasm,lib,app" \
		--prefix-colors "orange,yellow,green"

# テストの実行
test:
	@echo "Running tests..."
	cargo test --workspace
	pnpm run test:ts
	@echo "All tests completed!"

# TypeScriptテストのみ
test-ts:
	@echo "Running TypeScript tests..."
	pnpm --filter @nap5/gnrng-id test:run
	pnpm --filter app test:run
	@echo "TypeScript tests completed!"

# Rustテストのみ
test-rust:
	@echo "Running Rust tests..."
	cargo test --workspace
	@echo "Rust tests completed!"

# ベンチマークの実行
benchmark:
	@echo "Running benchmarks..."
	pnpm --filter @nap5/gnrng-id benchmark
	@echo "Benchmarks completed!"

# 型チェック
typecheck:
	@echo "Running TypeScript type checking..."
	pnpm run typecheck
	@echo "Type checking completed!"

# コード品質チェック
check:
	@echo "Running code quality checks..."
	pnpm run check:rust
	pnpm run check:ts
	@echo "Code quality checks completed!"

# フォーマット
format:
	@echo "Formatting code..."
	pnpm run format:rust
	pnpm run format:ts
	@echo "Code formatting completed!"

# クリーンアップ
clean:
	@echo "Cleaning up..."
	rm -rf packages/crates/gnrng-id/pkg
	rm -rf packages/lib/dist
	rm -rf packages/app/dist
	@echo "Cleanup completed!"

# 完全クリーンアップ
clean-all: clean
	@echo "Deep cleaning..."
	cargo clean
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf packages/*/*/node_modules
	@echo "Deep cleanup completed!"

# ライブラリの公開（npm）
publish-npm:
	@echo "Publishing to npm..."
	pnpm --filter @nap5/gnrng-id build
	pnpm --filter @nap5/gnrng-id publish:npm
	@echo "Published to npm successfully!"

# ライブラリの公開（JSR）
publish-jsr:
	@echo "Publishing to JSR..."
	pnpm --filter @nap5/gnrng-id build
	pnpm --filter @nap5/gnrng-id publish:jsr
	@echo "Published to JSR successfully!"

# 両方のレジストリに公開
publish-all: publish-npm publish-jsr
	@echo "Published to all registries successfully!"

# ヘルプ
help:
	@echo "Available commands:"
	@echo "  setup             - Complete project setup (recommended)"
	@echo "  setup-quick       - Quick setup without cleanup"
	@echo "  build-wasm-dev    - Build WASM package for development"
	@echo "  build-wasm-prod   - Build WASM package for production"
	@echo "  build-lib         - Build TypeScript library"
	@echo "  build             - Build entire project"
	@echo "  dev               - Start development server"
	@echo "  dev-all           - Start full development mode with watchers"
	@echo "  watch-wasm        - Watch and rebuild WASM"
	@echo "  watch-lib         - Watch and rebuild library"
	@echo "  test              - Run all tests"
	@echo "  test-ts           - Run TypeScript tests only"
	@echo "  test-rust         - Run Rust tests only"
	@echo "  benchmark         - Run performance benchmarks"
	@echo "  typecheck         - Run TypeScript type checking"
	@echo "  check             - Run code quality checks"
	@echo "  format            - Format all code"
	@echo "  clean             - Clean build artifacts"
	@echo "  clean-all         - Deep clean everything"
	@echo "  publish-npm       - Publish library to npm"
	@echo "  publish-jsr       - Publish library to JSR"
	@echo "  publish-all       - Publish to all registries"
	@echo "  help              - Show this help message"

.PHONY: setup setup-quick build-wasm-dev build-wasm-prod build-lib build dev dev-all watch-wasm watch-lib test test-ts test-rust benchmark typecheck check format clean clean-all publish-npm publish-jsr publish-all help install