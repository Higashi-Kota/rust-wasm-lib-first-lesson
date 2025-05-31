import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// WASM初期化
import initMath from '@internal/wasm-math'
import initText from '@internal/wasm-text'
import initUtils from '@internal/wasm-utils'

async function init() {
  try {
    // 各WASMモジュールを初期化
    await Promise.all([initMath(), initText(), initUtils()])

    console.log('✅ All WASM modules initialized successfully!')

    // Reactアプリをレンダリング
    const rootElement = document.getElementById('root')
    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      )
    } else {
      throw new Error('Root element not found')
    }
  } catch (error) {
    console.error('❌ Failed to initialize WASM modules:', error)

    // エラー表示
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: system-ui;
          background-color: #fee2e2;
          color: #dc2626;
          text-align: center;
          padding: 2rem;
        ">
          <div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">WASM初期化エラー</h1>
            <p style="margin-bottom: 1rem;">WASMモジュールの初期化に失敗しました。</p>
            <p style="font-size: 0.875rem; color: #991b1b;">
              コンソールで詳細なエラー情報を確認してください。
            </p>
          </div>
        </div>
      `
    }
  }
}

// アプリケーション初期化
init()
