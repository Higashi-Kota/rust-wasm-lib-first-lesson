# 開発用のスコープ名（お好みで変更可能）
SCOPE = internal

# WASMクレートのビルド（開発用）
build-wasm-dev:
	@echo "Building WASM packages for development..."
	wasm-pack build packages/crates/wasm-math --target web --scope $(SCOPE) --dev
	wasm-pack build packages/crates/wasm-text --target web --scope $(SCOPE) --dev
	wasm-pack build packages/crates/wasm-utils --target web --scope $(SCOPE) --dev
	@echo "WASM packages built successfully!"

# WASMクレートのビルド（本番用）
build-wasm-prod:
	@echo "Building WASM packages for production..."
	wasm-pack build packages/crates/wasm-math --target web --scope $(SCOPE) --release
	wasm-pack build packages/crates/wasm-text --target web --scope $(SCOPE) --release
	wasm-pack build packages/crates/wasm-utils --target web --scope $(SCOPE) --release
	@echo "WASM packages built successfully!"

# 依存関係のインストール
install:
	@echo "Installing dependencies..."
	pnpm install
	@echo "Dependencies installed successfully!"

# 開発サーバーの起動（要concurrently）
dev:
	@echo "Starting development servers..."
	pnpm run dev

# 全体のビルド
build:
	@echo "Building entire project..."
	make build-wasm-prod
	pnpm run build
	@echo "Build completed successfully!"

# WASMクレートの監視ビルド（開発用）
watch-wasm:
	@echo "Starting WASM watch mode..."
	cargo watch -w packages/crates -s "make build-wasm-dev"

# クリーンアップ
clean:
	@echo "Cleaning up..."
	rm -rf packages/crates/*/pkg
	rm -rf packages/app/dist
	rm -rf packages/app/node_modules
	@echo "Cleanup completed!"

.PHONY: build-wasm-dev build-wasm-prod install dev build watch-wasm clean