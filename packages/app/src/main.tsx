import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// GNRNG-ID ライブラリの初期化
import { initWasm } from '@nap5/gnrng-id'

async function init() {
  try {
    // GNRNG-ID WASMモジュールを初期化
    await initWasm()

    console.log('✅ GNRNG-ID WASM module initialized successfully!')

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
    console.error('❌ Failed to initialize GNRNG-ID WASM module:', error)

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
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">📦 GNRNG-ID初期化エラー</h1>
            <p style="margin-bottom: 1rem;">
              GNRNG-ID WASMモジュールの初期化に失敗しました。
            </p>
            <p style="font-size: 0.875rem; color: #991b1b; margin-bottom: 1rem;">
              コンソールで詳細なエラー情報を確認してください。
            </p>
            <details style="margin-top: 1rem; text-align: left; max-width: 600px;">
              <summary style="cursor: pointer; font-weight: bold;">トラブルシューティング</summary>
              <ul style="margin-top: 0.5rem; padding-left: 1rem; font-size: 0.875rem;">
                <li>ブラウザがWebAssemblyをサポートしているか確認してください</li>
                <li>WASMファイルが正しくビルドされているか確認してください</li>
                <li>ネットワーク環境を確認してください</li>
                <li>開発者ツールのコンソールで詳細なエラーを確認してください</li>
              </ul>
            </details>
          </div>
        </div>
      `
    }
  }
}

// アプリケーション初期化
init()
