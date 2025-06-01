## 🔑 トークン設定ガイド

**必要なシークレット一覧**

| シークレット名  | 用途                        | 備考 |
|-----------------|-----------------------------|------|
| `NPM_TOKEN`     | npm 公開用トークン          | 外部サービス（npm）で作成・設定が必要 |
| `JSR_TOKEN`     | JSR 公開用トークン          | OIDC認証のおかげで不要になったらしい |
| `GITHUB_TOKEN`  | GitHub Actions 内で自動利用 | GitHub が自動で提供するため、別途作成・設定は不要 |

- `GITHUB_TOKEN` は **「GitHub が自動で提供してくれるトークン」** です。  
  そのため、npm や JSR のように外部サービスで個別にトークンを作成・設定する必要はありません。

### 1. NPM_TOKEN の設定

#### npmトークンの取得
1. [npmjs.com](https://www.npmjs.com) にログイン
2. 右上のアバター → **Access Tokens** をクリック
3. **Generate New Token** → **Granular Access Token** を選択
4. トークン名を入力（例：`github-actions-gnrng-id`）
5. **Generate Token** をクリック
6. 表示されたトークンをコピー（⚠️ 一度しか表示されません）

#### GitHubリポジトリでの設定
1. GitHubリポジトリの **Settings** タブ
2. 左サイドバーの **Secrets and variables** → **Actions**
3. **New repository secret** をクリック
4. Name: `NPM_TOKEN`
5. Secret: コピーしたnpmトークンを貼り付け
6. **Add secret** をクリック

### 2. JSR_TOKEN の設定

#### JSRトークンの取得

JSRトークンは作成不要です！OIDC認証のおかげでより安全になっています。

### 3. パッケージの初期設定

#### npm パッケージ名の予約
```bash
# 一度手動でパッケージを作成（空でもOK）
cd packages/lib
npm publish --dry-run  # テスト
npm publish --access public  # 実際の公開
```

#### JSR パッケージ名の予約
```bash
# JSRスコープの確認
npx jsr whoami
npx jsr publish --dry-run  # テスト
```

### 4. 設定確認

設定が完了したら、以下で確認：

```bash
# GitHub UI で確認
# Settings → Secrets and variables → Actions
```

### 5. 初回リリーステスト

手動でワークフローをトリガーしてテスト：

1. GitHubリポジトリの **Actions** タブ
2. **🚀 Release & Deploy** ワークフロー
3. **Run workflow** をクリック
4. バージョン（例：`0.1.0`）を入力
5. **Run workflow** を実行

### 6. トラブルシューティング

#### よくあるエラー

**npm 401 Unauthorized**
```bash
# トークンの権限を確認
# Automation トークンが必要
```

**JSR publish failed**  
TBD

**Docker push failed**
```bash
# GITHUB_TOKEN は自動で利用可能
# packages: write 権限が必要（workflow で設定済み）
```